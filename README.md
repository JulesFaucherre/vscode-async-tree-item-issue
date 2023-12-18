# problem-with-async-tree-view-item README

Reproduces a bug with VSCode extensions.

### Bug description

This extension presents a treeView with one element that has 3 three children. The parent element is collapsed and has
label "0" and its three children have, in order, the labels "0/0", "0/1", "0/2". Although the function
`getTreeItem(element)` is defined as an asynchronous function, the only element that awaits an asynchronous call is the
element "0/0".

The extension also contributes a command that reveals the "0/1" item.

To reproduce the bug, do not open the treeView and call the command `Reveal item 0/1`. This will open the treeView on
the said item, and you will realize that the list of children of "0" is:
 - "0/1"
 - "0/2"
 - "0/0"
and not the order mentioned above.

This is most likely coming from the fact that "0/0" makes an asynchronous call when calling `getTreeItem("0/0")`.
