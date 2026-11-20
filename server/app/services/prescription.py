"""처방전 항목 추출 — 인쇄된 9자리 제품코드를 기준으로 한 약씩 끊어 읽는다.

처방전은 약봉투와 달리 제품코드가 찍혀 있어서 이름을 맞출 필요가 없다.
코드 아래로 약품명 → 1회투약량 → 1일투여횟수 → 총투약일수 → 용법 순으로 나온다.
"""
import re

PRODUCT_CODE = re.compile(r'^\d{9}$')
NUMBER = re.compile(r'^\d+(?:\.\d+)?$')

MAX_TIMES = 10      # 1일 투여횟수 상한
MAX_DAYS = 365      # 총 투약일수 상한
LOOKAHEAD = 7       # 코드 한 줄 아래로 몇 줄까지 훑을지


def _clean_number(t: str) -> str:
    """'1.000' → '1', '0.500' → '0.5'"""
    f = float(t)
    return str(int(f)) if f == int(f) else str(f)


def extract_items(texts: list[str]) -> list[dict]:
    """[{product_code, raw_text, dose_once, times_per_day, total_days, usage}]"""
    n = len(texts)
    out = []

    for i, t in enumerate(texts):
        if not PRODUCT_CODE.match(str(t).strip()):
            continue

        name, nums, usage = None, [], None
        for j in range(i + 1, min(i + 1 + LOOKAHEAD, n)):
            s = str(texts[j]).strip()
            if not s:
                continue
            if PRODUCT_CODE.match(s):       # 다음 약 시작
                break
            if NUMBER.match(s):
                nums.append(s)
            elif name is None:
                name = s                    # 숫자 앞의 첫 글자줄 = 약품명
            elif nums:
                usage = s                   # 숫자 뒤의 글자줄 = 용법
                break

        # 약품명도 없고 숫자도 2개 미만이면 약이 아니다 (요양기관번호 등)
        if name is None or len(nums) < 2:
            continue

        dose_once = _clean_number(nums[0])
        times = _clean_number(nums[1]) if int(float(nums[1])) <= MAX_TIMES else None
        days = None
        if len(nums) >= 3 and 1 <= int(float(nums[2])) <= MAX_DAYS:
            days = _clean_number(nums[2])

        out.append({
            'product_code': str(t).strip(),
            'raw_text': name,
            'dose_once': dose_once,
            'times_per_day': times,
            'total_days': days,
            'usage': usage,
        })
    return out