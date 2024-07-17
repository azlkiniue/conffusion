type ClusterData = {
  "certificate-authority-data": string;
  server: string;
};

type Cluster = {
  cluster: ClusterData;
  name: string;
};

type ContextData = {
  cluster: string;
  user: string;
};

type Context = {
  context: ContextData;
  name: string;
};

type UserData = {
  "client-certificate-data": string;
  "client-key-data": string;
};

type User = {
  name: string;
  user: UserData;
};

export type KubernetesConfig = {
  apiVersion: string;
  clusters: Array<Cluster>;
  contexts: Array<Context>;
  "current-context": string;
  kind: string;
  preferences: object;
  users: Array<User>;
};