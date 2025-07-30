import paho.mqtt.client as mqtt
import ssl
import time

# === MQTT Configuration ===
BROKER = "rabbitmq.etsecure.xyz       # Your MQTT broker hostname or IP
PORT = 8883                   # Standard TLS port
TOPIC = "doors/12/status"                # Topic to publish to
CLIENT_ID = "test"            # MQTT client ID
CERT_FILE = "/certs/server.crt"    # Path to CA certificate

# Optional credentials
USERNAME = "client"
PASSWORD = "REDACTED"

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to broker over TLS")
    else:
        print(f"❌ Connection failed. Code: {rc}")

def on_disconnect(client, userdata, rc):
    print(f"🔌 Disconnected from broker with code {rc}")

# === MQTT Client Setup ===
client = mqtt.Client(client_id=CLIENT_ID, protocol=mqtt.MQTTv311)
client.on_connect = on_connect
client.on_disconnect = on_disconnect

# Set username and password if needed
client.username_pw_set(USERNAME, PASSWORD)

# Set up TLS/SSL
client.tls_set(
    ca_certs=CERT_FILE,
    certfile=None,
    keyfile=None,
    tls_version=ssl.PROTOCOL_TLS_CLIENT,
    cert_reqs=ssl.CERT_REQUIRED
)

# === Connect and Start Loop ===
client.connect(BROKER, PORT, keepalive=60)
client.loop_start()

# === Send Messages Periodically ===
try:
    while True:
        payload = "Hello from desktop MQTT client!"
        client.publish(TOPIC, payload)
        print(f"📤 Sent: {payload}")
        time.sleep(5)

except KeyboardInterrupt:
    print("🛑 Interrupted by user.")

finally:
    client.loop_stop()
    client.disconnect()
    print("✅ MQTT client disconnected cleanly.")
