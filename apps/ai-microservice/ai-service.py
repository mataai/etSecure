from datetime import datetime
import subprocess
import socketio
import face_recognition
import cv2
import numpy as np
import pickle
import requests
import os

TOKEN = os.environ.get("TOKEN", "")
SERVER_URL = os.environ.get("SERVER_URL", "http://desktop-max:3000")
COOLDOWN = int(os.environ.get("COOLDOWN", 10))

last_face_seen = ""
last_time = datetime.now()

io = socketio.Client()

io.on("connect_error", lambda e: print(f"Connection error: {e}"))

io.connect(SERVER_URL, auth={"token": TOKEN})


cv_scaler = 4  # Scale down the image to increase performance


def load_encodings():
    global known_face_encodings, known_face_names
    print("[INFO] loading encodings...")
    with open("/app/models/latest.pickle", "rb") as f:
        data = pickle.loads(f.read())
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]

load_encodings()

face_locations = []
face_encodings = []
faces = []


@io.on("connect")
def on_connect():
    print("Connected to the server.")


@io.on("message")
def catch_all(data):
    image_bytes = data.get("image")
    raw_room_id = data.get("roomId")
    room_id = raw_room_id.decode("utf-8") if isinstance(raw_room_id, bytes) else raw_room_id

    if image_bytes is None or room_id is None:
        print("[ERROR] Missing image or roomId")
        return

    #print(f"[INFO] Received image of size: {len(image_bytes)} bytes and RoomID: {room_id}")

    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        print("[ERROR] Failed to decode image")
        return

    process_frame(frame, room_id)



@io.on("train")
def handle_train_request():
    print("[INFO] Training requested, starting model training...")
    subprocess.run(["python3", "model_training.py"])
    print("[INFO] Training complete")
    load_encodings()


def process_frame(frame, roomId):
    global face_locations, face_encodings, faces, last_face_seen, last_time

    # Resize the frame using cv_scaler to increase performance (less pixels processed, less time spent)
    resized_frame = cv2.resize(frame, (0, 0), fx=(1 / cv_scaler), fy=(1 / cv_scaler))

    # Convert the image from BGR to RGB colour space, the facial recognition library uses RGB, OpenCV uses BGR
    rgb_resized_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)

    # Find all the faces and face encodings in the current frame of video
    face_locations = face_recognition.face_locations(rgb_resized_frame)
    face_encodings = face_recognition.face_encodings(
        rgb_resized_frame, face_locations, model="large"
    )

    faces = []

    for face_encoding in face_encodings:
        # See if the face is a match for the known face(s)
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        name = "Unknown"

        # Use the known face with the smallest distance to the new face
        face_distances = face_recognition.face_distance(
            known_face_encodings, face_encoding
        )
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = known_face_names[best_match_index]
            # Check if the detected face is in our authorized list
            print(f"Detected face: {name}")
        faces.append(name)

    # TODO send recognized face names to the server

    # if (len(faces) == 0):
    #     #print("[INFO] No faces recognized.")
    #     return frame

    # Face regonized
    #print(f"[INFO] Recognized faces: {faces}")

    # FOR DEBUGGING PURPOSES
    faces.append("6871d4298da22a354f8af193")


    timediff = (datetime.now() - last_time).total_seconds()
    if (last_face_seen == faces[0] and timediff < COOLDOWN):
        #print(f"[INFO] Same face seen again, skipping sending to server")
        return frame

    last_time = datetime.now()
    last_face_seen = faces[0]

    url = SERVER_URL + "/auth/request-open"
    headers = {"Authorization": f"Bearer "}
    payload = {"roomId": roomId, "userId": faces[0], "timestamp": str(datetime.now())}

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(
            f"[INFO] Sent recognized faces: {faces}, Response: {response.status_code}"
        )
    except Exception as e:
        print(f"[ERROR] Failed to send recognized faces: {e}")

    return frame


print("[INFO] Starting video stream listener...")
io.wait()
