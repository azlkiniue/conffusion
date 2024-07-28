type ClusterData = {
  "certificate-authority-data"?: string;
  "certificate-authority"?: string;
  "insecure-skip-tls-verify"?: boolean;
  "tls-server-name"?: string;
  server: string;
};

export type Cluster = {
  cluster: ClusterData;
  name: string;
};

type ContextData = {
  cluster: string;
  user: string;
  namespace?: string;
};

export type Context = {
  context: ContextData;
  name: string;
};

type UserData = {
  "auth-provider"?: object;
  "client-certificate-data"?: string;
  "client-certificate"?: string;
  "client-key-data"?: string;
  "client-key"?: string;
  exec?: object;
  token?: string;
  password?: string;
  username?: string;
};

export type User = {
  name: string;
  user: UserData;
};

export type KubernetesConfig = {
  apiVersion: "v1";
  clusters: Array<Cluster>;
  contexts: Array<Context>;
  "current-context": string;
  kind: "Config";
  preferences: object;
  users: Array<User>;
};