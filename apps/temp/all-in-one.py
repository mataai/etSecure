import paho.mqtt.client as mqtt
import ssl
import time
import RPi.GPIO as GPIO
from picamera2 import Picamera2
import cv2
import base64
import socketio

sio = socketio.Client()

sio.connect('http://desktop-mat:3000') # Replace with your server URL

DEBUG = False

# === MQTT Configuration ===
BROKER = "cloud-ind520"          
PORT = 8883                      
TOPIC = "test"                   
CLIENT_ID = "test"               
CERT_FILE = "./server.crt"    

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to broker over TLS")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Connection failed. Code: {rc}")

def on_message(client, userdata, msg):
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

# === GPIO Setup ===
PIR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# === Camera Setup ===
picam2 = Picamera2()
picam2.preview_configuration.main.size = (640, 480)
picam2.preview_configuration.main.format = "RGB888"
picam2.configure(picam2.create_still_configuration(main={"format": "BGR888", "size": (640, 480)}))
picam2.start()

print("PIR Motion Sensor is warming up...")
time.sleep(3)
print("Ready to detect motion!")

try:
    while True:
        if GPIO.input(PIR_PIN):
            if DEBUG:
                print("⚠️ Motion detected!")

            
            # Capture a frame
            frame = picam2.capture_array()

            # Encode the frame as JPEG -> Base64
            ret, buffer = cv2.imencode('.jpg', frame)
            b64_string = base64.b64encode(buffer).decode("utf-8")
            if ret:
                # Convert to bytes and send via socketio
                sio.emit('message', buffer.tobytes())
        elif DEBUG:
            print("No motion.")
        time.sleep(0.1)

except KeyboardInterrupt:
    sio.disconnect()
    picam2.stop()
    print("Program interrupted by user.")

finally:
    sio.disconnect()
    picam2.stop()
    cv2.destroyAllWindows()
    GPIO.cleanup()
    print("GPIO cleaned up. Exiting.")
