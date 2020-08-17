declare module 'imjoy-rpc' {
  type ImJoySetupRPCProps = {
    name: string;
    description: string;
    version: string;
  };

  interface ExportedFunctions {
    [name: string]: (props: any) => void;
  }

  interface ImJoyAPI {
    export: (funcs: ExportedFunctions) => void;
  }

  async function setupRPC(props: ImJoySetupRPCProps): ImJoyAPI;
}
