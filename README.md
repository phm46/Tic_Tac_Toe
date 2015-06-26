Description
==
Very simple Tic Tac Toe game

Online demo: http://jsfiddle.net/GcE2D/

HTML Markup
==
```html
<div id="game"></div>
```

Use
==
```js
$("#game").ticTacThis();
```

Options
==
You can change some options e.g. number of columns, rows, board size and how much marks do you need for win.

* **col**: number of columns 				// value more then 3
* **row**: number of rows 				// value more then 3
* **boardSize**: size of board 			// value between 200 and 1000
* **needForWin**: number of marks to win 	// value more then 3

Example
--
```js
$("#game").ticTacThis({col:5});
```
