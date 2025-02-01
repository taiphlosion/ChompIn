import sys
import qrcode
import os

def generate_qr(class_id):
    attendance_url = f"https://chompin.app/attendance?class={class_id}"

    qr = qrcode.make(attendance_url)

    output_directory = "public/qrcodes"
    os.makedirs(output_directory, exist_ok=True)
    qr_path = os.path.join(output_directory, f"{class_id}.png")

    qr.save(qr_path)

    print(qr_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No class ID provided")
        sys.exit(1)

    class_id = sys.argv[1]
    generate_qr(class_id)