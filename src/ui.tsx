import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

interface ComponentProperty {
  type: string;
  defaultValue: boolean | string;
  variantOptions?: string[];
}

interface ComponentProperties {
  [key: string]: ComponentProperty;
}

interface SelectedNode {
  name: string;
  id: string;
  type: string;
}

interface PluginMessage {
  type: string;
  properties: ComponentProperties;
  componentName: string;
  selectedNodes: SelectedNode[];
  isComponent: boolean;
}

const UI = () => {
  const [isComponentSelected, setIsComponentSelected] = useState(false);
  const [properties, setProperties] = useState<ComponentProperties>({});
  const [componentName, setComponentName] = useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<SelectedNode[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const pluginMessage = event.data.pluginMessage as PluginMessage;
      console.log("Received message:", pluginMessage);
      
      if (pluginMessage.type === "selection-update") {
        console.log("Updating selection state:", {
          properties: pluginMessage.properties,
          componentName: pluginMessage.componentName,
          selectedNodes: pluginMessage.selectedNodes,
          isComponent: pluginMessage.isComponent
        });
        
        setProperties(pluginMessage.properties);
        setComponentName(pluginMessage.componentName);
        setSelectedNodes(pluginMessage.selectedNodes);
        setIsComponentSelected(pluginMessage.isComponent);
      } else if (pluginMessage.type === "property-added") {
        console.log("Property added:", pluginMessage.properties);
        setProperties(pluginMessage.properties);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAddBooleanProperty = () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: "add-boolean-property"
      } 
    }, "*");
  };

  const PropertyTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Property Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Default Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(properties).map(([key, value]) => (
            <tr key={key}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {key}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {value.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {String(value.defaultValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const NodeSelectionView = () => (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
      <p className="text-gray-600 text-lg">
        {selectedNodes.length === 0 
          ? "No nodes selected"
          : `${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''} selected`
        }
      </p>
      <button
        onClick={handleAddBooleanProperty}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg ${
          selectedNodes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={selectedNodes.length === 0}
      >
        Add Boolean Property
      </button>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col justify-start items-center">
      <div className="flex justify-start items-center w-full h-[88px] bg-gray-800 mb-6 px-6">
        <div className="font-be-vietnam-pro text-xl text-white text-opacity-100 leading-none tracking-normal font-bold">
          Component Properties
        </div>
      </div>
      <div className="p-6 w-full">
        {isComponentSelected ? (
          <div>
            <h2 className="font-vietnam text-black font-bold text-lg mb-6">
              {componentName}
            </h2>
            <PropertyTable />
          </div>
        ) : (
          <NodeSelectionView />
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("react-page"));
root.render(<UI />);
