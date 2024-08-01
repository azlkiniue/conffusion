<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { merge } from '$lib/components/common/handle-config-yaml';
	import { fly } from 'svelte/transition';
	import Plus from 'svelte-radix/Plus.svelte';
	import Minus from 'svelte-radix/Minus.svelte';
	import EditDialog from '$lib/components/boilerplate-ui/edit-dialog.svelte';
	import { base, added, merged } from '$lib/stores';

	let activeTab = 'base';
	function changeTab(tab: string) {
		activeTab = tab;
	}

	let contextFirst = 'true';

	function reset() {
		$base = '';
		$added = [''];
		$merged = '';
		changeTab('base');
	}

	// https://stackoverflow.com/a/64113219
	async function readText(event: Event): Promise<string> {
		const target = event.target as HTMLInputElement;
		if (!target.files) return '';

		const file = target.files.item(0);
		if (!file) return '';

		const result = await file.text();
		return result;
	}
</script>

<Tabs.Root value={activeTab}>
	<Tabs.Content value="base">
		<Card.Root>
			{#if activeTab === 'base'}
				<div transition:fly={{ x: 24, duration: 150 }}>
					<Card.Header>
						<Card.Title>Start</Card.Title>
						<Card.Description>
							Fill in your current config here. Click next to add new config to merge.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="base">Base config</Label>
							<Textarea id="base" class="font-mono" bind:value={$base} />
							<div class="flex justify-between gap-1">
								<Input type="file" on:change={(e) => readText(e).then((res) => ($base = res))} />
								<EditDialog config={$base} typeConfig="base" />
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-end">
						<Button on:click={() => changeTab('add')}>Next</Button>
					</Card.Footer>
				</div>
			{/if}
		</Card.Root>
	</Tabs.Content>

	<Tabs.Content value="add">
		<Card.Root>
			{#if activeTab === 'add'}
				<div transition:fly={{ x: 24, duration: 150 }}>
					<Card.Header>
						<Card.Title>Add</Card.Title>
						<Card.Description>
							Add your new config here. You can add multiple kubeconfigs at once. Click merge button
							to proceed.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="add">New config(s)</Label>
							<!-- placeholder to remove label warning -->
							<input id="add" type="text" hidden />
							{#each $added as addedItem, key}
								<Textarea name={`config-${key}`} class="font-mono" bind:value={addedItem} />
								<div class="!mb-3 flex justify-between gap-1">
									<Input
										type="file"
										on:change={(e) => readText(e).then((res) => ($added[key] = res))}
									/>
									<EditDialog config={$added[key]} typeConfig={'added-'.concat(key.toString())} />
								</div>
							{/each}
							<div class="flex justify-start gap-1 pb-1">
								<Button size="sm" on:click={() => ($added = [...$added, ''])}>
									<Plus class="mr-2 h-4 w-4" />
									Add config
								</Button>
								<Button
									size="sm"
									variant="destructive"
									disabled={$added.length === 1}
									on:click={() => ($added = $added.slice(0, -1))}
								>
									<Minus class="mr-2 h-4 w-4" />
									Remove config
								</Button>
							</div>
						</div>
						<div class="space-y-1">
							<Label for="mergeOpt">Merge Strategy</Label>
							<!-- placeholder to remove label warning -->
							<input id="mergeOpt" type="text" hidden />
							<RadioGroup.Root bind:value={contextFirst}>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="true" id="r1" />
									<Label for="r1" class="font-normal">Context First</Label>
								</div>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="false" id="r2" />
									<Label for="r2" class="font-normal">Context Last</Label>
								</div>
								<RadioGroup.Input name="spacing" />
							</RadioGroup.Root>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="outline" on:click={() => changeTab('base')}>Previous</Button>
						<Button
							on:click={() => {
								changeTab('merged');
								$merged = merge($base, $added, contextFirst === 'true');
							}}
						>
							Merge
						</Button>
					</Card.Footer>
				</div>
			{/if}
		</Card.Root>
	</Tabs.Content>

	<Tabs.Content value="merged">
		<Card.Root>
			{#if activeTab === 'merged'}
				<div transition:fly={{ x: 24, duration: 150 }}>
					<Card.Header>
						<Card.Title>Merge</Card.Title>
						<Card.Description>
							Your merged config is ready. Click start over to reset.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="merged">Result config</Label>
							<Textarea id="merged" class="font-mono" bind:value={$merged} />
							<EditDialog config={$merged} typeConfig="merged" />
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="outline" on:click={() => changeTab('add')}>Previous</Button>
						<Button on:click={() => reset()}>Start Over</Button>
					</Card.Footer>
				</div>
			{/if}
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
