
import os
import paho.mqtt.client as mqtt
import ssl
import time
import RPi.GPIO as GPIO
import config

# === MQTT Configuration ===
BROKER = config.BROKER
PORT = config.PORT
TOPIC = None  # Set this from main script
CLIENT_ID = config.CLIENT_ID
CERT_FILE = config.CERT_FILE
MQTT_USER = config.MQTT_USER
MQTT_PASS = config.MQTT_PASS

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to broker over TLS")
        if TOPIC:
            client.subscribe(TOPIC)
    else:
        print(f"❌ Connection failed. Code: {rc}")

def on_message(client, userdata, msg):
    print(msg)
    if msg.payload.decode() == "unlock":
        print("🔓 Unlocking door!")
        GPIO.output(GPIO.RELAY_PIN, GPIO.HIGH)
        time.sleep(5)
        GPIO.output(GPIO.RELAY_PIN, GPIO.LOW)
    print(f"📨 Received on '{msg.topic}': {msg.payload.decode()}")

def on_disconnect(client, userdata, rc):
    print(f"🔌 Disconnected from broker with code {rc}")

def create_mqtt_client(topic, relay_pin):
    global TOPIC
    TOPIC = topic
    GPIO.RELAY_PIN = relay_pin  # Store relay pin in GPIO for callback access
    client = mqtt.Client(client_id=config.CLIENT_ID, protocol=mqtt.MQTTv311)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    client.username_pw_set(config.MQTT_USER, config.MQTT_PASS)
    client.tls_set(
        ca_certs=config.CERT_FILE,
        certfile=None,
        keyfile=None,
        tls_version=ssl.PROTOCOL_TLS_CLIENT,
        cert_reqs=ssl.CERT_REQUIRED
    )
    client.connect(config.BROKER, config.PORT)
    client.loop_start()
