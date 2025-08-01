

import asyncio
import RPi.GPIO as GPIO
import cv2
from picamera2 import Picamera2
from mqtt import create_mqtt_client
from ws import connect_ws, send_ping, send_message, disconnect_ws
import config


# GPIO setup from config
GPIO.setmode(GPIO.BCM)
GPIO.setup(config.PIR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(config.RELAY_PIN, GPIO.OUT)


# Create and start MQTT client
create_mqtt_client(config.TOPIC, config.RELAY_PIN)

# Camera setup
picam2 = Picamera2()
picam2.preview_configuration.main.size = (640, 480)
picam2.preview_configuration.main.format = "RGB888"
picam2.configure(picam2.create_still_configuration(main={"format": "BGR888", "size": (640, 480)}))
picam2.start()

DEBUG = config.DEBUG

async def main():
    await connect_ws()
    print("PIR Motion Sensor is warming up...")
    await asyncio.sleep(3)
    print("Ready to detect motion!")
    try:
        while True:
            # await send_ping()
            if GPIO.input(config.PIR_PIN):
                if DEBUG:
                    print("⚠️ Motion detected!")
                frame = picam2.capture_array()
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    await send_message(buffer.tobytes())
            await asyncio.sleep(0.1)
    except KeyboardInterrupt:
        await disconnect_ws()
        picam2.stop()
        print("Program interrupted by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await disconnect_ws()
        picam2.stop()
        GPIO.cleanup()
        print("GPIO cleaned up. Exiting.")

if __name__ == "__main__":
    asyncio.run(main())
