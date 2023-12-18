import * as vscode from "vscode";

type Element = {
  awaits: boolean;
  children?: Element[];
};

const tree: Element[] = [
  {
    awaits: false,
    children: [
      {
        awaits: true,
      },
      {
        awaits: false,
      },
      {
        awaits: false,
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
  const treeDataProvider: vscode.TreeDataProvider<string> = {
    getChildren(indices) {
      if (indices === undefined) {
        return tree.map((_, index) => `${index}`);
      }
      const element = getElement(indices);
      const children = element.children ?? [];
      return children.map((_, i) => `${indices}/${i}`);
    },
    async getTreeItem(indices) {
      const elem = getElement(indices);
      if (elem.awaits) {
        await Promise.resolve();
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
