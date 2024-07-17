import YAML from 'yaml';
import type { KubernetesConfig } from '$lib/models/kubeconfig';

function parse(config: string): KubernetesConfig {
	return YAML.parse(config) as KubernetesConfig;
}

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

function handleConfigDuplicate(
	mergedConfig: KubernetesConfig,
	addedConfig: KubernetesConfig
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

		let newContextName: string = addedContext.name;
		let newClusterName: string = addedContext.context.cluster;
		let newUserName: string = addedContext.context.user;
		if (isContextNameExist) {
			newContextName = generateNewName(addedContext.name);
			console.log(`Context name ${addedContext.name} already exists`);
		}
		if (isClusterNameExist) {
			newClusterName = `${addedContext.context.cluster}-${newContextName}`;
			console.log(`Cluster name ${addedContext.context.cluster} already exists`);
		}
		if (isUserNameExist) {
			newUserName = `${addedContext.context.user}-${newContextName}`;
			console.log(`User name ${addedContext.context.user} already exists`);
		}
		if (isClusterNameExist || isUserNameExist || isContextNameExist) {
			newConfig.clusters.forEach((cluster) => {
				if (cluster.name === addedContext.context.cluster) {
					cluster.name = newClusterName;
				}
			});
			newConfig.users.forEach((user) => {
				if (user.name === addedContext.context.user) {
					user.name = newUserName;
				}
			});
			newConfig.contexts.forEach((context) => {
				if (context.name === addedContext.name) {
					context.name = newContextName;
					context.context.cluster = newClusterName;
					context.context.user = newUserName;
				}
			});
		}
	});

	return newConfig;
}

export function merge(base: string, added: string): string {
	const baseConfig = parse(base);
	const addedConfig = parse(added);

	const mergedConfig = structuredClone(baseConfig);
	const newConfig = handleConfigDuplicate(baseConfig, addedConfig);
	mergedConfig.clusters.push(...newConfig.clusters);
	mergedConfig.contexts.push(...newConfig.contexts);
	mergedConfig.users.push(...newConfig.users);

	return YAML.stringify(mergedConfig);
}