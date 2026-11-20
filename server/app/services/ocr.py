import os
os.environ['FLAGS_use_mkldnn'] = '0'

import cv2
from paddleocr import PaddleOCR

# 서버가 켜질 때 한 번만 만든다. 요청마다 만들면 매우 느려진다.
_ocr = PaddleOCR(
    text_detection_model_name='PP-OCRv5_mobile_det',
    text_recognition_model_name='korean_PP-OCRv5_mobile_rec',
    text_det_limit_side_len=1280,
    use_doc_orientation_classify=True,
    use_textline_orientation=True,
    use_doc_unwarping=False,
    enable_mkldnn=False,
)
print('OCR 준비 완료')

ROTATE_THRESHOLD = 0.80


def _resize(img, t=1600):
    h, w = img.shape[:2]
    s = t / max(h, w)
    if s < 1:
        return cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    return img


def _once(img):
    out = _ocr.predict(img)
    r = out[0] if out else None
    if r is None:
        return [], [], 0.0
    texts = list(r['rec_texts'])
    scores = [float(s) for s in r['rec_scores']]
    avg = sum(scores) / len(scores) if scores else 0.0
    return texts, scores, avg


def run_ocr(image_path: str) -> tuple[list[str], list[float]]:
    img = _resize(cv2.imread(image_path))

    texts, scores, avg = _once(img)

    # 신뢰도가 낮으면 뒤집힌 사진으로 보고 180도 돌려 재시도
    if avg < ROTATE_THRESHOLD:
        r_texts, r_scores, r_avg = _once(cv2.rotate(img, cv2.ROTATE_180))
        if r_avg > avg:
            print(f'180도 보정 적용  {avg:.2f} → {r_avg:.2f}')
            return r_texts, r_scores

    return texts, scores