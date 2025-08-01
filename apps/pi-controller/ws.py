import socketio
import asyncio
import config

sio = socketio.AsyncClient()

sio.on('connect_error', lambda e: print(f"Connection error: {e}"))

async def connect_ws():
    await sio.connect(config.WS_URL, auth={'token': config.WS_TOKEN})
    return sio

async def send_ping():
    if sio.connected:
        try:
            await sio.emit('ping', 'keepalive')
        except Exception as e:
            print(f"Emit error: {e}")

async def send_message(data):
    if sio.connected:
        try:
            await sio.emit('message', data)
        except Exception as e:
            print(f"SocketIO error: {e}")

async def disconnect_ws():
    await sio.disconnect()
