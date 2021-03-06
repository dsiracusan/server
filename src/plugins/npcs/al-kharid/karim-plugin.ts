import { npcAction } from '@server/world/action/npc-action';
import { itemIds } from '@server/world/config/item-ids';
import { dialogue, Emote, execute } from '@server/world/actor/dialogue';
import { widgets } from '@server/config';

const talkToAction : npcAction = (details) => {
    const { player, npc } = details;

    dialogue([player, { npc, key: 'karim' }], [
        karim => [ Emote.HAPPY, `Would you like to buy a nice kebab? Only one gold.`],
        options => [
            `I think i'll give it a miss.`, [
                player => [Emote.DROWZY, `I think i'll give it a miss.`],
            ],
            `Yes please.`, [
                player => [Emote.HAPPY, `Yes please.`],
                execute(() => {
                    const inventory = player.inventory;
                    if (inventory.has(itemIds.coins)) {
                        const index = inventory.findIndex(itemIds.coins);
                        const item = inventory.items[index];

                        if (!inventory.hasSpace()) {
                            player.sendMessage(`You don't have enough space in your inventory.`);
                            return;
                        }

                        inventory.remove(index);
                        if (item.amount !== 1) {
                            inventory.add( { itemId: itemIds.coins, amount: item.amount - 1 });
                        }

                        inventory.add({ itemId: itemIds.kebab, amount: 1 });
                        player.outgoingPackets.sendUpdateAllWidgetItems(widgets.inventory, inventory);
                        return;
                    }

                    if (!inventory.has(itemIds.coins)) {
                        dialogue([player, { npc, key: 'karim' }], [
                            player => [Emote.ANGRY, `Oops, I forgot to bring any money with me.`],
                            karim => [Emote.GENERIC, `Come back when you have some.`]
                        ]);
                    }
                })
            ]
        ]
    ]);
};

export default [
    { type: 'npc_action', npcs: 'rs:alkharid_karim', options: 'talk-to', walkTo: true, action: talkToAction }
];
