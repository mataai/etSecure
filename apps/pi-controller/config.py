import os

PIR_PIN = int(os.getenv("PIR_PIN", 17))
RELAY_PIN = int(os.getenv("RELAY_PIN", 21))
ROOM_ID = os.getenv("ROOM_ID", "68717478f9d185d6407efec3")
TOPIC = f"rooms/{ROOM_ID}/commands"
BROKER = os.getenv("MQTT_BROKER", "rabbitmq.etsecure.xyz")
PORT = int(os.getenv("MQTT_PORT", 8883))
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "rpi-max")
CERT_FILE = os.getenv("MQTT_CERT_FILE", "../../certs/server.crt")
MQTT_USER = os.getenv("MQTT_USER", "client")
MQTT_PASS = os.getenv("MQTT_PASS", "REDACTED")
WS_TOKEN = os.getenv("WS_TOKEN", "REDACTED")
WS_URL = os.getenv("WS_URL", "https://api.etsecure.xyz")
DEBUG = bool(int(os.getenv("DEBUG", "0")))
