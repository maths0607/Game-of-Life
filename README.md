# 🧬 Игра «Жизнь» Конвея — Доказательство Универсальности

Интерактивная веб-страница на русском языке, объясняющая **вычислительную универсальность** Игры «Жизнь» Конвея.

## 🌐 Демо

> После публикации на GitHub Pages: `https://ВАШ_ЛОГИН.github.io/game-of-life-ru/`

## 📖 Что внутри

| Раздел | Содержание |
|--------|-----------|
| § 01 Правила | Четыре правила B3/S23 с визуальными карточками |
| § 02 Паттерны | Зоопарк форм с живой анимацией |
| § 03 Симулятор | Полный симулятор с 8 паттернами и рисованием |
| § 04–05 Логика | Интерактивные вентили NOT/AND/OR/NAND/NOR/XOR |
| § 06 Доказательство | Пошаговое доказательство универсальности |
| § 07 Рендел | Реализация МТ в Игре «Жизнь» (2001) |
| § 08 Ресурсы | Golly, паттерны, инструкции |

## 🚀 Публикация на GitHub Pages

```bash
git clone https://github.com/ВАШ_ЛОГИН/game-of-life-ru.git
cd game-of-life-ru
# скопируйте index.html сюда
git add index.html
git commit -m "Conway's Game of Life"
git push origin main
# Settings → Pages → main / (root) → Save
```

## 🦩 Запуск машины Тьюринга в Golly

1. Скачайте Golly: `golly.sourceforge.net`
2. Скачайте `tm.rle`: `rendell-attic.org/gol/tm.htm`
3. `File → Open → tm.rle` → пробел → ускорение `]`
4. Один цикл МТ = **11 040 поколений**

Для универсальной МТ Чэпмена включите алгоритм **HashLife** в Golly.

## 📚 Источники

- Rendell, P. (2001). A Turing Machine in Conway's Game Life
- Berlekamp, Conway, Guy (1982). Winning Ways for your Mathematical Plays
- Chapman (2002). Universal Turing Machine — 268,096 cells
