figma.showUI(__html__, { height: 600, width: 800 });

figma.on("selectionchange", async () => {
  console.log("Selection changed:", figma.currentPage.selection);
  const selections = figma.currentPage.selection;
  
  // 선택된 노드가 없는 경우
  if (selections.length === 0) {
    figma.ui.postMessage({
      type: "selection-update",
      properties: {},
      componentName: "",
      selectedNodes: [],
      isComponent: false
    });
    return;
  }

  // 단일 컴포넌트/컴포넌트셋 선택한 경우
  if (selections.length === 1 && 
      (selections[0].type === "COMPONENT" || selections[0].type === "COMPONENT_SET")) {
    const componentNode = selections[0];
    if ("componentPropertyDefinitions" in componentNode) {
      figma.ui.postMessage({
        type: "selection-update",
        properties: componentNode.componentPropertyDefinitions,
        componentName: componentNode.name,
        selectedNodes: [],
        isComponent: true
      });
    }
    return;
  }

  // 그 외의 모든 경우 (일반 노드 선택)
  figma.ui.postMessage({
    type: "selection-update",
    properties: {},
    componentName: "",
    selectedNodes: selections.map(node => ({
      name: node.name,
      id: node.id,
      type: node.type
    })),
    isComponent: false
  });
});

// 공통 부모 컴포넌트/컴포넌트셋 찾기
function findCommonParentComponent(nodes: readonly SceneNode[]): ComponentNode | ComponentSetNode | null {
  // 각 노드의 모든 부모들을 찾음
  const allParentComponents = nodes.map(node => {
    const parents: (ComponentNode | ComponentSetNode)[] = [];
    let parent = node.parent;
    while (parent) {
      if (parent.type === "COMPONENT" || parent.type === "COMPONENT_SET") {
        parents.push(parent as ComponentNode | ComponentSetNode);
      }
      parent = parent.parent;
    }
    return parents;
  });

  // 공통 부모가 없는 경우
  if (allParentComponents.some(parents => parents.length === 0)) {
    return null;
  }

  // 가장 가까운 공통 부모 찾기
  const firstNodeParents = allParentComponents[0];
  for (const potentialCommonParent of firstNodeParents) {
    const isCommon = allParentComponents.every(parents =>
      parents.some(parent => parent.id === potentialCommonParent.id)
    );
    if (isCommon) {
      return potentialCommonParent;
    }
  }

  return null;
}

// UI로부터 메시지 수신
figma.ui.onmessage = async (msg) => {
  if (msg.type === "add-boolean-property") {
    const selections = figma.currentPage.selection;
    if (selections.length === 0) return;

    const parentComponent = findCommonParentComponent(selections);
    
    if (parentComponent) {
      try {
        // 선택된 노드들의 이름을 조합하여 프로퍼티 이름 생성
        const nodeNames = selections.map(node => node.name);
        let baseName = "isVisible";
        
        if (nodeNames.length === 1) {
          baseName = `isVisible_${nodeNames[0]}`;
        } else {
          baseName = `isVisible_Group`;
        }

        // 유니크한 프로퍼티 이름 생성
        let propertyName = baseName;
        let counter = 1;
        while (propertyName in parentComponent.componentPropertyDefinitions) {
          propertyName = `${baseName}${counter}`;
          counter++;
        }

        // 프로퍼티 추가
        const propertyId = await parentComponent.addComponentProperty(
          propertyName,
          "BOOLEAN",
          true
        );

        // 선택된 노드들에 프로퍼티 바인딩 시도
        let bindingSuccess = 0;
        let bindingFailed = 0;

        for (const node of selections) {
          try {
            if ('componentPropertyReferences' in node) {
              node.componentPropertyReferences = {
                visible: propertyId
              };
              bindingSuccess++;
            } else {
              bindingFailed++;
            }
          } catch (error) {
            console.log(`Binding failed for node: ${node.name}`);
            bindingFailed++;
          }
        }

        // 결과 로깅 및 알림
        const resultMessage = `Added property: ${propertyName}\nBinding: ${bindingSuccess} succeeded, ${bindingFailed} failed`;
        console.log(resultMessage);
        figma.notify(resultMessage);

        // UI 업데이트
        figma.ui.postMessage({
          type: "property-added",
          properties: parentComponent.componentPropertyDefinitions,
          componentName: parentComponent.name
        });

      } catch (error) {
        console.error("Error adding property:", error);
        figma.notify(`Error: ${error.message}`, { error: true });
      }
    } else {
      figma.notify("Selected nodes must be in the same component", { error: true });
    }
  }
};
  