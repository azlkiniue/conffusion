<script lang="ts">
	import YAML from 'yaml';
	import * as Dialog from '../ui/dialog';
	import { parse } from '../common/handle-config-yaml';
	import { buttonVariants } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
	import { validateKubeConfig, type KubernetesConfig } from '$lib/models/kubeconfig';
	import { base, added, merged } from '$lib/stores';
	import Pencil2 from 'svelte-radix/Pencil2.svelte';

	export let config: string;
	export let typeConfig: string;
	let parsedConfig: KubernetesConfig;
	let isValidKubeconfig: boolean;

  function parseConfig() {
    try {
      parsedConfig = parse(config);
      isValidKubeconfig = validateKubeConfig(YAML.parse(config));
    } catch (e) {
      isValidKubeconfig = false;
    }
  }

	function save() {
		if (typeConfig === 'base') {
			$base = YAML.stringify(parsedConfig);
		}
		if (typeConfig === 'merged') {
			$merged = YAML.stringify(parsedConfig);
		}
		if (typeConfig.startsWith('added')) {
			const index = parseInt(typeConfig.split('-')[1]);
			$added[index] = YAML.stringify(parsedConfig);
		}
	}
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'secondary' })}
		on:click={() => (parseConfig())}
	>
		<Pencil2 class="mr-2 h-4 w-4" />
		Easy Edit
	</Dialog.Trigger>
	<Dialog.Content class="max-h-full overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Easy Edit Kubeconfig</Dialog.Title>
			<Dialog.Description>
				Easily edit your kubeconfig here, just adjust the values using the form below and click save
				changes.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if isValidKubeconfig}
				{#each parsedConfig.clusters as cluster, key}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="cls-{key}" class="text-right">Cluster #{key + 1} Name</Label>
						<Input id="cls-{key}" bind:value={cluster.name} class="col-span-3" />
						<Label for="cls-addr-{key}" class="text-right">Cluster #{key + 1} Address</Label>
						<Input id="cls-addr-{key}" bind:value={cluster.cluster.server} class="col-span-3" />
					</div>
				{/each}
				<hr />
				{#each parsedConfig.users as user, key}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="usr-{key}" class="text-right">User #{key + 1} Name</Label>
						<Input id="usr-{key}" bind:value={user.name} class="col-span-3" />
					</div>
				{/each}
				<hr />
				{#each parsedConfig.contexts as context, key}
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="ctx-{key}" class="text-right">Context #{key + 1} Name</Label>
						<Input id="ctx-{key}" bind:value={context.name} class="col-span-3" />
						<Label for="ctx-cls-{key}" class="text-right">Context #{key + 1} Cluster Name</Label>
						<Input id="ctx-cls-{key}" bind:value={context.context.cluster} class="col-span-3" />
						<Label for="ctx-usr-{key}" class="text-right">Context #{key + 1} User Name</Label>
						<Input id="ctx-usr-{key}" bind:value={context.context.user} class="col-span-3" />
					</div>
				{/each}
			{:else}
				<p class="text-xl text-destructive">Kubeconfig is not valid or empty</p>
			{/if}
		</div>
		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
			<Dialog.Close
				disabled={!isValidKubeconfig}
				class={buttonVariants({ variant: 'default' })}
				on:click={() => save()}
			>
				Save changes
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
