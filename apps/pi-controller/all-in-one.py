import paho.mqtt.client as mqtt
import ssl
import time
import RPi.GPIO as GPIO
from picamera2 import Picamera2
import cv2
import base64
import socketio
import asyncio

sio = socketio.AsyncClient()

ROOM_ID = "68717478f9d185d6407efec3"
TOKEN = "REDACTED"

sio.on('connect_error', lambda e: print(f"Connection error: {e}"))

sio.connect('https://api.etsecure.xyz', auth={'token': TOKEN}) # Replace with your server URL

DEBUG = False

# === GPIO Setup ===
PIR_PIN = 17
RELAY_PIN = 21
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(RELAY_PIN, GPIO.OUT)

# === MQTT Configuration ===
BROKER = "rabbitmq.etsecure.xyz"
PORT = 8883
TOPIC = "rooms/" + ROOM_ID + "/commands"
CLIENT_ID = "rpi-max"
CERT_FILE = "../../certs/server.crt"

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to broker over TLS")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Connection failed. Code: {rc}")

def on_message(client, userdata, msg):
    print(msg)
    if msg.payload.decode() == "unlock":
        print("🔓 Unlocking door!")
        GPIO.output(RELAY_PIN, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(RELAY_PIN, GPIO.LOW)

    print(f"📨 Received on '{msg.topic}': {msg.payload.decode()}")

def on_disconnect(client, userdata, rc):
    print(f"🔌 Disconnected from broker with code {rc}")

# === MQTT Client Setup ===
client = mqtt.Client(protocol=mqtt.MQTTv311)
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect
client.username_pw_set("client", "REDACTED")
client.tls_set(
    ca_certs=CERT_FILE,
    certfile=None,
    keyfile=None,
    tls_version=ssl.PROTOCOL_TLS_CLIENT,
    cert_reqs=ssl.CERT_REQUIRED
)

# === Connect and Start MQTT client
client.connect(BROKER, PORT, keepalive=180)
client.loop_start()

# === Camera Setup ===
picam2 = Picamera2()
picam2.preview_configuration.main.size = (640, 480)
picam2.preview_configuration.main.format = "RGB888"
picam2.configure(picam2.create_still_configuration(main={"format": "BGR888", "size": (640, 480)}))
picam2.start()

# print("PIR Motion Sensor is warming up...")
# time.sleep(3)
# print("Ready to detect motion!")

# try:
#     while True:
#         if sio.connected:
#             try:
#                 sio.emit('ping', 'keepalive')
#             except Exception as e:
#                 print(f"Emit error: {e}")
#         if GPIO.input(PIR_PIN):
#             if DEBUG:
#                 print("⚠️ Motion detected!")
#             frame = picam2.capture_array()
#             ret, buffer = cv2.imencode('.jpg', frame)
#             b64_string = base64.b64encode(buffer).decode("utf-8")
#             if ret:
#                 try:
#                     sio.connect('https://api.etsecure.xyz', auth={'token': TOKEN})
#                     sio.emit('message', buffer.tobytes())
#                     # else:
#                     #     print("reconnecting...")
#                     #     while not sio.connected:
#                     #         time.sleep(0.5)
#                     #     print("connected")
#                 except Exception as e:
#                     print(f"SocketIO error: {e}")
#         elif DEBUG:
#             GPIO.output(RELAY_PIN, GPIO.LOW)
#         time.sleep(0.1)
# except KeyboardInterrupt:
#     sio.disconnect()
#     picam2.stop()
#     print("Program interrupted by user.")
# except Exception as e:
#     print(f"An error occurred: {e}")
# finally:
#     sio.disconnect()
#     picam2.stop()
#     cv2.destroyAllWindows()
#     GPIO.cleanup()
#     print("GPIO cleaned up. Exiting.")


async def main():
    print("PIR Motion Sensor is warming up...")
    await asyncio.sleep(3)
    print("Ready to detect motion!")

    try:
        while True:
            if sio.connected:
                try:
                    await sio.emit('ping', 'keepalive')
                except Exception as e:
                    print(f"Emit error: {e}")
            if GPIO.input(PIR_PIN):
                if DEBUG:
                    print("⚠️ Motion detected!")
                frame = picam2.capture_array()
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    try:
                        if not sio.connected:
                            await sio.connect('https://api.etsecure.xyz', auth={'token': TOKEN})
                        await sio.emit('message', buffer.tobytes())
                    except Exception as e:
                        print(f"SocketIO error: {e}")
            elif DEBUG:
                GPIO.output(RELAY_PIN, GPIO.LOW)
            await asyncio.sleep(0.1)
    except KeyboardInterrupt:
        await sio.disconnect()
        picam2.stop()
        print("Program interrupted by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        picam2.stop()
        cv2.destroyAllWindows()
        GPIO.cleanup()
        print("GPIO cleaned up. Exiting.")

if __name__ == "__main__":
    asyncio.run(main())
