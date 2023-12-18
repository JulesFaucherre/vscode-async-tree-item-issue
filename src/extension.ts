import * as vscode from "vscode";

type Element = {
  awaits: false | number;
  children?: Element[];
};

const tree: Element[] = [
  {
    awaits: false,
    children: [
      {
        awaits: 3,
      },
      {
        awaits: 2,
      },
      {
        awaits: 1,
      },
    ],
  },
];

function getElement(indices: string): Element {
  let children = tree;
  let elem: Element = { awaits: false };
  for (const index of indices.split("/")) {
    const i = parseInt(index);
    elem = children[i];
    children = elem?.children ?? [];
  }
  return elem;
}

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("treeitem issue");
  context.subscriptions.push(output);

  const treeDataProvider: vscode.TreeDataProvider<string> = {
    getChildren(indices) {
      let ret: string[];

      if (indices === undefined) {
        ret = tree.map((_, index) => `${index}`);
      } else {
        const element = getElement(indices);
        const children = element.children ?? [];
        ret = children.map((_, i) => `${indices}/${i}`);
      }
      output.appendLine(
        `For element ${indices}, children return = ${ret.join(", ")}`
      );
      return ret;
    },
    async getTreeItem(indices) {
      const elem = getElement(indices);
      const awaits = elem.awaits;
      if (typeof awaits === "number") {
        await new Promise((ok) => setTimeout(ok, awaits));
      }
      const treeItem = new vscode.TreeItem(
        indices,
        elem.children
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None
      );
      return treeItem;
    },
    getParent(indices) {
      const reducedIndices = indices.split("/").slice(0, -1).join("/");
      if (reducedIndices === "") {
        return null;
      }
      return reducedIndices;
    },
  };

  const treeView = vscode.window.createTreeView("sidebarWithAsyncTreeItem", {
    treeDataProvider,
  });

  context.subscriptions.push(treeView);

  let disposable = vscode.commands.registerCommand(
    "problem-with-async-tree-view-item.revealItem0/1",
    () => {
      treeView.reveal("0/1");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
