import os
from imutils import paths
import face_recognition
import pickle
import cv2
import re

model_dir = "./models"

def get_latest_version():
    version = 0
    pattern = re.compile(rf"(\d+)\.pickle")
    for fname in os.listdir(model_dir):
        match = pattern.match(fname)
        if match:
            version = max(version, int(match.group(1)))
    return version

print("[INFO] start processing faces...")
imagePaths = list(paths.list_images("dataset"))
knownEncodings = []
knownNames = []

for (i, imagePath) in enumerate(imagePaths):
    print(f"[INFO] processing image {i + 1}/{len(imagePaths)}")
    name = imagePath.split(os.path.sep)[-2]
    
    image = cv2.imread(imagePath)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    boxes = face_recognition.face_locations(rgb, model="hog")
    encodings = face_recognition.face_encodings(rgb, boxes)
    
    for encoding in encodings:
        knownEncodings.append(encoding)
        knownNames.append(name)


latest_version = get_latest_version()
new_version = latest_version + 1
model_filename = f"{new_version}.pickle"
model_path = os.path.join(model_dir, model_filename)
model_new_latest_path = os.path.join(model_dir, "latest.pickle")

if not os.path.exists(model_dir):
    os.makedirs(model_dir)


print("[INFO] serializing encodings...")
data = {"encodings": knownEncodings, "names": knownNames}
with open(model_path, "wb") as f:
    f.write(pickle.dumps(data))

with open(model_new_latest_path, "wb") as f:
    f.write(pickle.dumps(data))

print(f"[INFO] Training complete. Encodings saved to 'latest.pickle' and '{new_version}.pickle'")
