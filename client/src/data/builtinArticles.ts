import type { Article, PracticeMode } from '../types'

export const builtinArticles: Record<PracticeMode, Article[]> = {
  english: [
    {
      id: 'en-1',
      title: 'The Great Gatsby - Opening',
      content: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing any one, he told me, just remember that all the people in this world have not had the advantages that you have had.',
      mode: 'english',
      language: 'en',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'en-2',
      title: 'A Tale of Two Cities - Opening',
      content: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.',
      mode: 'english',
      language: 'en',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'en-3',
      title: 'Pride and Prejudice - Opening',
      content: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.',
      mode: 'english',
      language: 'en',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
  ],
  chinese: [
    {
      id: 'zh-1',
      title: '背影 - 朱自清',
      content: '我与父亲不相见已二年余了，我最不能忘记的是他的背影。那年冬天，祖母死了，父亲的差使也交卸了，正是祸不单行的日子。我从北京到徐州，打算跟着父亲奔丧回家。到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。',
      mode: 'chinese',
      language: 'zh',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'zh-2',
      title: '从百草园到三味书屋 - 鲁迅',
      content: '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱文公的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹。',
      mode: 'chinese',
      language: 'zh',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'zh-3',
      title: '荷塘月色 - 朱自清',
      content: '这几天心里颇不宁静。今晚在院子里坐着乘凉，忽然想起日日走过的荷塘，在这满月的光里，总该另有一番样子吧。月亮渐渐地升高了，墙外马路上孩子们的欢笑，已经听不见了；妻在屋里拍着闰儿，迷迷糊糊地哼着眠歌。',
      mode: 'chinese',
      language: 'zh',
      source: 'builtin',
      createdAt: new Date().toISOString(),
    },
  ],
  code: [
    {
      id: 'py-1',
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
      createdAt: new Date().toISOString(),
    },
    {
      id: 'py-2',
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
      createdAt: new Date().toISOString(),
    },
    {
      id: 'py-3',
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
      createdAt: new Date().toISOString(),
    },
  ],
}

export function findArticleById(id: string): Article | undefined {
  for (const articles of Object.values(builtinArticles)) {
    const found = articles.find((a) => a.id === id)
    if (found) return found
  }
  return undefined
}
