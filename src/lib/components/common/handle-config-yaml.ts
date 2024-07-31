import YAML from 'yaml';
import { type KubernetesConfig, type Cluster, type Context, type User, validateKubeConfig } from '$lib/models/kubeconfig';

const emptyConfig = `apiVersion: v1
clusters: []
contexts: []
current-context: ""
kind: Config
preferences: {}
users: []`;

/**
 * Parses a YAML configuration string and returns a KubernetesConfig object.
 * If the configuration is invalid or cannot be parsed, a default empty configuration is returned.
 * @param config - The YAML configuration string to parse.
 * @returns The parsed KubernetesConfig object.
 */
function parse(config: string): KubernetesConfig {
  try {
    const result: KubernetesConfig = YAML.parse(config);
    const isValidKubeConfig = validateKubeConfig(result);

    if (typeof result !== 'object' || !isValidKubeConfig) {
      console.warn(`Invalid configuration: '${config}'`);
      return YAML.parse(emptyConfig) as KubernetesConfig;
    }
    return result;
  } catch (e) {
    console.warn(`Error parsing configuration: '${config}'`);
    console.error(`YAML parse error:\n${(e as Error).message}`);
    return YAML.parse(emptyConfig) as KubernetesConfig;
  }
}

/**
 * Generates a new name based on the given name.
 * If the last part of the name is a number, it increments the number by 1.
 * Otherwise, it appends '-2' to the name.
 * 
 * @param name - The original name.
 * @returns The new generated name.
 */
function generateNewName(name: string): string {
  //split the name by '-'
  //if the last element is a number, increment it by 1
  //else add '-2' to the name
  const nameParts = name.split('-');
  const lastPart = nameParts[nameParts.length - 1];
  const lastPartNumber = parseInt(lastPart);

  if (!isNaN(lastPartNumber)) {
    nameParts[nameParts.length - 1] = `${lastPartNumber + 1}`;
  } else {
    nameParts.push('2');
  }
  const newName = nameParts.join('-');

  return newName;
}

/**
 * Recursively checks and generates a new name if the given name already exists in the array.
 * 
 * @param arrays - The array to check for name existence.
 * @param name - The original name.
 * @returns The new generated name.
 */
function recursiveCheckNewName(arrays: Cluster[] | Context[] | User[], name: string): string {
  let newName = name;
  const isExist = arrays.some((item) => item.name === newName);
  if (isExist) {
    newName = generateNewName(newName);
    newName = recursiveCheckNewName(arrays, newName);
  }
  return newName;
}

/**
 * Handles duplicate configurations in the KubernetesConfig object.
 * 
 * @param mergedConfig - The merged KubernetesConfig object.
 * @param addedConfig - The added KubernetesConfig object.
 * @param isContextFirst - Optional. Determines whether the context name should be placed first in the new name. Defaults to true.
 * @returns The updated KubernetesConfig object with handled duplicate configurations.
 */
function handleConfigDuplicate(
  mergedConfig: KubernetesConfig,
  addedConfig: KubernetesConfig,
  isContextFirst = true
): KubernetesConfig {
  let isClusterNameExist = false;
  let isContextNameExist = false;
  let isUserNameExist = false;
  const newConfig = structuredClone(addedConfig);

  addedConfig.contexts.forEach((addedContext) => {
    isContextNameExist = mergedConfig.contexts.some(
      (mergedContext) => mergedContext.name === addedContext.name
    );
    isClusterNameExist = mergedConfig.clusters.some(
      (mergedCluster) => mergedCluster.name === addedContext.context.cluster
    );
    isUserNameExist = mergedConfig.users.some(
      (mergedUser) => mergedUser.name === addedContext.context.user
    );

    // Initialize variables
    let newContextName = addedContext.name;
    let newClusterName = addedContext.context.cluster;
    let newUserName = addedContext.context.user;

    // Check and handle context name existence
    if (isContextFirst && isContextNameExist) {
      newContextName = recursiveCheckNewName(mergedConfig.contexts, newContextName);
    }

    // Check and handle cluster name existence
    if (isClusterNameExist) {
      if (isContextFirst) newClusterName = `${newClusterName}-${newContextName}`;
      else newClusterName = recursiveCheckNewName(mergedConfig.clusters, newClusterName);
    }

    // Check and handle user name existence
    if (isUserNameExist) {
      if (isContextFirst) newUserName = `${newUserName}-${newContextName}`;
      else newUserName = recursiveCheckNewName(mergedConfig.users, newUserName);
    }

    // Adjust context name for context last scenario
    if (!isContextFirst && (isClusterNameExist || isUserNameExist)) {
      newContextName = `${newUserName}@${newClusterName}`;
    }

    if (isClusterNameExist || isUserNameExist || isContextNameExist) {
      const clusterIdx = newConfig.clusters.findIndex((cluster) => cluster.name === addedContext.context.cluster);
      newConfig.clusters[clusterIdx].name = newClusterName;

      const userIdx = newConfig.users.findIndex((user) => user.name === addedContext.context.user);
      newConfig.users[userIdx].name = newUserName;

      const contextIdx = newConfig.contexts.findIndex((context) => context.name === addedContext.name);
      newConfig.contexts[contextIdx].name = newContextName;
      newConfig.contexts[contextIdx].context.cluster = newClusterName;
      newConfig.contexts[contextIdx].context.user = newUserName;
    }
  });

  return newConfig;
}

/**
 * Merges two YAML configuration strings and returns the merged result.
 * 
 * @param base - The base YAML configuration string.
 * @param added - The YAML configuration string to be added.
 * @param isContextFirst - Optional. Specifies whether the added configuration should be placed before the base configuration. Default is false.
 * @returns The merged YAML configuration string.
 */
export function mergeItem(base: string, added: string, isContextFirst = false): string {
  const baseConfig = parse(base);
  const addedConfig = parse(added);

  const mergedConfig = structuredClone(baseConfig);
  const newConfig = handleConfigDuplicate(baseConfig, addedConfig, isContextFirst);
  mergedConfig.clusters.push(...newConfig.clusters);
  mergedConfig.contexts.push(...newConfig.contexts);
  mergedConfig.users.push(...newConfig.users);

  return YAML.stringify(mergedConfig);
}

/**
 * Merges multiple YAML configuration strings and returns the merged result.
 * 
 * @param base - The base YAML configuration string.
 * @param added - The array of YAML configuration strings to be added.
 * @param isContextFirst - Optional. Specifies whether the added configuration should be placed before the base configuration. Default is false.
 * @returns The merged YAML configuration string.
 */
export function merge(base: string, added: string[], isContextFirst = false): string {
  let mergedConfig = base;
  added.forEach((config) => {
    mergedConfig = mergeItem(mergedConfig, config, isContextFirst);
  });

  return mergedConfig;
}