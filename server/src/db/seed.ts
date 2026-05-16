import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const builtinArticles = [
  // English articles
  {
    title: 'The Great Gatsby - Opening',
    content: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing any one, he told me, just remember that all the people in this world have not had the advantages that you have had.',
    mode: 'english',
    language: 'en',
    source: 'builtin',
  },
  {
    title: 'A Tale of Two Cities - Opening',
    content: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.',
    mode: 'english',
    language: 'en',
    source: 'builtin',
  },
  {
    title: 'Pride and Prejudice - Opening',
    content: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.',
    mode: 'english',
    language: 'en',
    source: 'builtin',
  },
  {
    title: '1984 - Opening',
    content: 'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.',
    mode: 'english',
    language: 'en',
    source: 'builtin',
  },
  {
    title: 'The Catcher in the Rye - Opening',
    content: 'If you really want to hear about it, the first thing you\'ll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don\'t feel like going into it, if you want to know the truth.',
    mode: 'english',
    language: 'en',
    source: 'builtin',
  },

  // Chinese articles
  {
    title: '背影 - 朱自清',
    content: '我与父亲不相见已二年余了，我最不能忘记的是他的背影。那年冬天，祖母死了，父亲的差使也交卸了，正是祸不单行的日子。我从北京到徐州，打算跟着父亲奔丧回家。到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。',
    mode: 'chinese',
    language: 'zh',
    source: 'builtin',
  },
  {
    title: '从百草园到三味书屋 - 鲁迅',
    content: '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱文公的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹。',
    mode: 'chinese',
    language: 'zh',
    source: 'builtin',
  },
  {
    title: '荷塘月色 - 朱自清',
    content: '这几天心里颇不宁静。今晚在院子里坐着乘凉，忽然想起日日走过的荷塘，在这满月的光里，总该另有一番样子吧。月亮渐渐地升高了，墙外马路上孩子们的欢笑，已经听不见了；妻在屋里拍着闰儿，迷迷糊糊地哼着眠歌。',
    mode: 'chinese',
    language: 'zh',
    source: 'builtin',
  },
  {
    title: '春 - 朱自清',
    content: '盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。',
    mode: 'chinese',
    language: 'zh',
    source: 'builtin',
  },
  {
    title: '匆匆 - 朱自清',
    content: '燕子去了，有再来的时候；杨柳枯了，有再青的时候；桃花谢了，有再开的时候。但是，聪明的，你告诉我，我们的日子为什么一去不复返呢？是有人偷了他们罢：那是谁？又藏在何处呢？是他们自己逃走了罢：现在又到了哪里呢？',
    mode: 'chinese',
    language: 'zh',
    source: 'builtin',
  },

  // Code articles (Python)
  {
    title: 'Python - Hello World & 基础',
    content: `def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    message = greet("World")
    print(message)`,
    mode: 'code',
    language: 'python',
    source: 'builtin',
  },
  {
    title: 'Python - 列表推导式',
    content: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

squares = [n ** 2 for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
matrix = [[i * j for j in range(3)] for i in range(3)]

print(f"Squares: {squares}")
print(f"Evens: {evens}")`,
    mode: 'code',
    language: 'python',
    source: 'builtin',
  },
  {
    title: 'Python - 类与装饰器',
    content: `from functools import wraps
import time

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

class Calculator:
    def __init__(self, value: float = 0):
        self._value = value

    @property
    def value(self) -> float:
        return self._value

    @timer
    def add(self, n: float) -> "Calculator":
        return Calculator(self._value + n)`,
    mode: 'code',
    language: 'python',
    source: 'builtin',
  },
  {
    title: 'Python - 异步编程',
    content: `import asyncio
from typing import AsyncGenerator

async def fetch_data(url: str) -> dict:
    """Simulate an async API call."""
    await asyncio.sleep(1)
    return {"url": url, "status": 200}

async def process_urls(urls: list[str]) -> AsyncGenerator:
    tasks = [fetch_data(url) for url in urls]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        yield result

async def main():
    urls = ["https://api.example.com/1", "https://api.example.com/2"]
    async for data in process_urls(urls):
        print(f"Got: {data}")

if __name__ == "__main__":
    asyncio.run(main())`,
    mode: 'code',
    language: 'python',
    source: 'builtin',
  },
  {
    title: 'Python - 数据处理',
    content: `from dataclasses import dataclass
from collections import Counter

@dataclass(frozen=True)
class Record:
    name: str
    score: float
    grade: str

def analyze_scores(records: list[Record]) -> dict:
    scores = [r.score for r in records]
    avg = sum(scores) / len(scores)
    grade_dist = Counter(r.grade for r in records)
    return {
        "average": round(avg, 2),
        "min": min(scores),
        "max": max(scores),
        "distribution": dict(grade_dist),
    }`,
    mode: 'code',
    language: 'python',
    source: 'builtin',
  },
]

async function seed() {
  console.log('Seeding database...')

  // Clear existing articles
  await prisma.article.deleteMany()

  // Insert built-in articles
  for (const article of builtinArticles) {
    await prisma.article.create({ data: article })
  }

  console.log(`Seeded ${builtinArticles.length} articles`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
