import socketio
import face_recognition
import cv2
import numpy as np
import pickle


io = socketio.Client()

io.connect("http://laptop-mat:3000")

cv_scaler = 4  # Scale down the image to increase performance
data = {
    "encodings": [],
    "names": [],
}
# print("[INFO] loading encodings...")
# with open("encodings.pickle", "rb") as f:
#     data = pickle.loads(f.read())
known_face_encodings = data["encodings"]
known_face_names = data["names"]

face_locations = []
face_encodings = []
face_names = []
# List of names that will trigger the GPIO pin
authorized_names = [
    "john",
    "alice",
    "bob",
]  # Replace with names you wish to authorise THIS IS CASE-SENSITIVE

@io.on("connect")
def on_connect():
    print("Connected to the server.")

@io.on("message")
def catch_all(event):
    # Convert the byte array to a NumPy array
    nparr = np.frombuffer(event, np.uint8)
    # Decode the NumPy array as a JPEG image
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    process_frame(frame)


def process_frame(frame):
    global face_locations, face_encodings, face_names

    # Resize the frame using cv_scaler to increase performance (less pixels processed, less time spent)
    resized_frame = cv2.resize(frame, (0, 0), fx=(1 / cv_scaler), fy=(1 / cv_scaler))

    # Convert the image from BGR to RGB colour space, the facial recognition library uses RGB, OpenCV uses BGR
    rgb_resized_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)

    # Find all the faces and face encodings in the current frame of video
    face_locations = face_recognition.face_locations(rgb_resized_frame)
    face_encodings = face_recognition.face_encodings(
        rgb_resized_frame, face_locations, model="large"
    )

    face_names = []
    authorized_face_detected = False

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
            if name in authorized_names:
                authorized_face_detected = True
        face_names.append(name)

    # Control the GPIO pin based on face detection
    if authorized_face_detected:
        print("Authorized face detected, turning on GPIO pin")

    return frame


print(f"[INFO] Starting video stream listener... {io.connected}")
io.wait()
