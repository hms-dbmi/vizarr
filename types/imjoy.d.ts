declare module 'imjoy-rpc' {
  type ImJoySetupRPCProps = {
    name: string;
    description: string;
    version: string;
  };

  interface ImJoyAPI {
    export: (funcs: Record<string, (...args: any[]) => void>) => void;
  }

  export const imjoyRPC = {
    setupRPC(props: ImJoySetupRPCProps): Promise<ImJoyAPI>;,
  };
}
