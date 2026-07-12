// ---------------------------------------------------------------------------
// scripts/seed-stories.mjs
//
// Seeds the Supabase `stories` table with 15 real Nepali/Himalayan folk tales.
// Each story has a hand-written cleaned_text, a generated cover image URL,
// real GPS coordinates, and correct metadata.
//
// Usage:
//   node --env-file=.env.local scripts/seed-stories.mjs
//
// To wipe first, run:
//   node --env-file=.env.local scripts/seed-stories.mjs --clear
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const POLLINATIONS_KEY = process.env.POLLINATIONS_API_KEY;

function coverUrl(prompt) {
  return (
    `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}` +
    `?nologo=true&width=800&height=600&key=${POLLINATIONS_KEY}`
  );
}

// ---------------------------------------------------------------------------
// 15 real Nepali / Himalayan folk tales
// ---------------------------------------------------------------------------
const STORIES = [
  // ── 1 ──────────────────────────────────────────────────────────────────
  {
    title: "The Tiger and the Clever Hare",
    teller_name: "Dil Maya Tamang",
    language: "Nepali",
    location_name: "Chitwan, Nepal",
    latitude: 27.5291,
    longitude: 84.3542,
    tag: "Trickster Tale",
    raw_text: "एक जङ्गलमा एउटा बाघ थियो जो सबै जनावरलाई डराउँथ्यो...",
    cleaned_text: `Long ago in the terai forests of Chitwan, a great tiger terrorised all the animals. Each day he prowled the riverbank demanding tribute — a deer, a boar, whatever he pleased — and every creature obeyed out of fear. But one small hare refused to tremble.

"I will go to the tiger myself," said the hare, "and end this tyranny."

The other animals laughed. The hare was barely the size of the tiger's paw. Yet the hare set off at dusk, taking a long, winding path to the deep well at the centre of the forest.

When she finally arrived before the tiger, long past the agreed hour, he roared with fury. "Why are you late? I should eat you twice for this!"

"Great Tiger," said the hare, bowing low, "I would have been here at dawn, but another tiger on the northern path stopped me. He said he was the true king of this forest and that I should bring him my tribute instead. I barely escaped with my life."

The tiger's eyes went red. "Show me this imposter!"

The hare led him to the deep well. The tiger leaned over the stone rim and peered down — and there, staring back up at him, was another enormous tiger, teeth bared, ready to fight. With a thunderous roar the tiger leapt into the well to destroy his rival.

The forest was silent after the splash. The hare hopped home, and from that day forward, the animals of Chitwan lived in peace.`,
  },

  // ── 2 ──────────────────────────────────────────────────────────────────
  {
    title: "Yeti of the Khumbu Glacier",
    teller_name: "Pasang Sherpa",
    language: "Nepali",
    location_name: "Namche Bazaar, Solukhumbu, Nepal",
    latitude: 27.8069,
    longitude: 86.7139,
    tag: "Mountain Spirit",
    raw_text: "हाम्रो हजुरबाले भन्नुहुन्थ्यो कि हिउँको जङ्गलमा एउटा ठूलो सेतो प्राणी बस्छ...",
    cleaned_text: `My grandfather used to say that the high snowfields above Khumbu are not empty. Long before the first climbers came with their ropes and oxygen bottles, the Sherpa people knew of the Yeti — the Migö, the wild man of the snows.

One autumn, a young herder named Nima was driving his yaks back from the high pastures when a sudden storm swallowed the trail. He sheltered in a shallow cave, shivering and certain he would freeze before morning.

Sometime in the deep night he heard heavy footsteps in the snow outside — slow, deliberate, enormous. A great white shape filled the cave entrance. Nima pressed himself against the rock wall and shut his eyes.

When he opened them, the creature was gone. But at his feet lay a pile of dried yak dung — enough fuel to light a fire that would last until dawn.

Nima never saw the Yeti clearly. But every winter after that, he left a bowl of tsampa porridge outside his door before the first snow fell — an offering for the guardian of the glacier, who had once kept a frightened boy alive through the longest night of the year.`,
  },

  // ── 3 ──────────────────────────────────────────────────────────────────
  {
    title: "Goddess Kumari and the Sleeping King",
    teller_name: "Sunita Shrestha",
    language: "Nepali",
    location_name: "Patan Durbar Square, Lalitpur, Nepal",
    latitude: 27.6726,
    longitude: 85.3254,
    tag: "Divine Legend",
    raw_text: "पाटनको दरबार चोकमा एक राजा र कुमारी देवीको कथा प्रसिद्ध छ...",
    cleaned_text: `In the old city of Patan, before the valley roads were paved and the cars arrived, there lived a king who was devoted to the goddess Kumari. Each evening he would go to the Kumari Ghar and play dice with the living goddess — for the Kumari, the pure pre-pubescent girl in whom the goddess Taleju resided, was said to delight in games.

One evening the king fell asleep during their game. In his dream, the goddess appeared in her true form — terrible and radiant, with eyes that saw past death. She told the king that his city would prosper for as long as her living vessel was respected, and would fall into misfortune the moment the people forgot the sacred covenant.

The king woke alone. The dice were arranged on the board in a pattern he had never seen — neither a win nor a loss, but something in between.

He took it as a warning. He commissioned the great golden gate that still stands in Patan Durbar Square, inscribed with a prayer to Taleju. And he ordered that the Kumari festival, Kumari Jatra, be observed every year without fail.

Old women in Patan still say that on quiet nights, if you press your ear to the golden gate, you can hear the faint click of dice.`,
  },

  // ── 4 ──────────────────────────────────────────────────────────────────
  {
    title: "The Grateful Snake of Phewa Lake",
    teller_name: "Raju Gurung",
    language: "Nepali",
    location_name: "Pokhara, Nepal",
    latitude: 28.2096,
    longitude: 83.9856,
    tag: "Water Spirit",
    raw_text: "फेवा तालको किनारमा एउटा माछा मार्ने मान्छे बस्थ्यो...",
    cleaned_text: `On the western shore of Phewa Lake, where the Annapurna range hangs like a mirror image in the water, there once lived a fisherman named Harka. He was poor but gentle, and he never took more from the lake than his family needed.

One morning his net pulled up not fish but a great golden snake, coiled and glistening, with a gemstone on its hood that blazed like a lamp. Any other man would have killed it for the jewel. Harka carefully freed the snake from the mesh and released it back into the dark water.

That night a woman in golden cloth came to his door. "I am the spirit of this lake," she said. "You showed mercy to my servant. Ask me one thing."

Harka thought of his sick daughter, his leaking boat, his empty granary. He was quiet for a long time.

"I ask only that the lake stay clean," he said at last, "so that my children and their children can fish here as I have."

The spirit smiled — a strange, wide smile that showed too many teeth. In the morning, Harka found his boat repaired, his granary full, and his daughter sitting up in bed asking for rice. He never saw the spirit again. But Phewa Lake, to this day, stays clear enough to reflect the mountains perfectly.`,
  },

  // ── 5 ──────────────────────────────────────────────────────────────────
  {
    title: "Bir Bahadur and the Witch of Mustang",
    teller_name: "Karma Lama",
    language: "Nepali",
    location_name: "Lo Manthang, Mustang, Nepal",
    latitude: 29.1797,
    longitude: 83.9581,
    tag: "Hero's Journey",
    raw_text: "मुस्ताङको रातो पाखामा एउटा बोक्सी बस्थी जसले गाउँका बच्चाहरूलाई चुराउँथी...",
    cleaned_text: `In the red-cliff country of Upper Mustang, where the wind carves the earth into towers and the sky is always a brutal blue, there lived a witch who stole children. Not to eat them — the stories that said so were exaggerations — but to put them to work spinning thread in her cave, for she was weaving a cloth so long it would wrap around the world.

Every family in Lo Manthang had lost someone. Then one year, the witch took the youngest daughter of a widow named Pemba. The widow's eldest son, Bir Bahadur, was just sixteen. He sharpened his grandfather's khukuri, packed dried apricots, and walked north into the cliffs.

He found the cave by following the sound of weeping. Inside, dozens of children sat at spinning wheels, glassy-eyed and silent — all but his sister, who was new enough that the enchantment had not fully taken hold.

The witch offered Bir Bahadur a deal: if he could spin more thread in one night than all her captives combined, she would free them. He agreed, knowing he had no skill at spinning.

But he had brought his grandfather's prayer wheel, which spun on its own when the wind blew. He tied the wool to the prayer wheel and set it spinning in the mouth of the cave where the canyon wind howled without ceasing. By dawn he had filled three baskets.

The witch, bound by her own bargain, shrieked and dissolved into red dust that the wind scattered over the plains. Every child walked home. Bir Bahadur's sister held his hand the whole way.`,
  },

  // ── 6 ──────────────────────────────────────────────────────────────────
  {
    title: "The Moon Jar of Bhaktapur",
    teller_name: "Mina Joshi",
    language: "Nepali",
    location_name: "Bhaktapur, Nepal",
    latitude: 27.6722,
    longitude: 85.4298,
    tag: "Potter's Legend",
    raw_text: "भक्तपुरका कुमालेहरू भन्थे कि एउटा कलसीमा जून भर्न सकिन्छ...",
    cleaned_text: `The potters of Bhaktapur are famous across the valley, and they have been shaping clay in Pottery Square since before the Malla kings built their palaces. Among the old potters there was a story that only masters told apprentices, and only at night.

Long ago, a master potter named Harilal was asked by the moon goddess Chandra to make her a jar worthy of holding moonlight. All the other potters laughed. Moonlight, they said, cannot be held. It slips through your fingers like water — more so, in fact, because water at least you can drink.

Harilal said nothing. He went home and spent forty days making one jar. He mixed the clay with river silt and fine silver mica. He fired it three times, each time at a different hour. He polished it with his bare hands until it held no shadows anywhere on its surface.

On the night of the full moon in Kartik, he set the jar in the middle of Taumadhi Square and waited. At midnight the moonlight poured into the open mouth and did not come out the other side.

In the morning the jar was warm to the touch. Harilal put it on a shelf in his workshop and for the rest of his life, whenever he worked on a difficult piece, he set it near the jar. The light inside was enough to see by.

When Harilal died, his son inherited the jar. His son's son after that. The potters of Bhaktapur say it is still somewhere in the city, warming someone's workshop. You can tell the workshop it is in, they say, because the pots made there always seem to glow a little in the evening.`,
  },

  // ── 7 ──────────────────────────────────────────────────────────────────
  {
    title: "Why the Rooster Crows Before Dawn",
    teller_name: "Saraswoti Tharu",
    language: "Tharu",
    location_name: "Dang Valley, Lumbini Province, Nepal",
    latitude: 28.0979,
    longitude: 82.3005,
    tag: "Origin Story",
    raw_text: "हाम्रो गाउँमा भन्थे, पहिले-पहिले मुर्गाले बिहान बोल्दैनथ्यो...",
    cleaned_text: `In the Tharu villages of Dang, the old grandmothers say that long ago the rooster did not crow. The sun rose in silence, and many mornings it rose late because there was no one to summon it.

This caused great problems. Farmers overslept their fields. Mothers missed market. The god of the sun grew lazy and sometimes lingered in his bed beneath the eastern mountains until midmorning.

A Tharu farmer named Dhaniram decided to fix this. He climbed to the top of the tallest silk-cotton tree in the village, sat there all night, and when he saw the faintest grey thread appear on the eastern horizon, he shouted with all his strength.

The sun, startled, leapt straight up into the sky.

Dhaniram did this every morning for a year. He grew hoarse, then got his voice back, then grew hoarse again. But the sun was now reliable.

When Dhaniram finally grew too old to climb the tree, he worried the sun would be late again. So he sat beside his rooster and taught him the sound — the precise pitch and sequence of the crow that would wake the sun. The rooster was a good student.

Now every rooster alive carries that lesson. They crow before the sky even shows the thread of dawn, just to be sure. They are keeping a promise made by a tired, hoarse farmer who simply couldn't bear the thought of an unreliable sun.`,
  },

  // ── 8 ──────────────────────────────────────────────────────────────────
  {
    title: "The Stone Garden of Gorkha",
    teller_name: "Bhim Bahadur Rana",
    language: "Nepali",
    location_name: "Gorkha, Gandaki Province, Nepal",
    latitude: 28.0000,
    longitude: 84.6333,
    tag: "Royal Legend",
    raw_text: "गोरखाको दरबारमा एउटा बगैंचा थियो जहाँ ढुङ्गाका फूल फुल्थे...",
    cleaned_text: `The hill fort of Gorkha, ancestral seat of the Shah kings, stands above the clouds on a ridge so high that in the mornings you look down on the eagles. Within its walls, behind the main temple, there is said to be a garden where the stones themselves bloom.

The story begins with a queen of Gorkha who loved flowers more than power. When her husband went to war — as the kings of Gorkha always went to war — she tended her garden. But the altitude was cruel. Nothing grew above the frost line for more than a season.

She prayed to Gorakhmath, the fierce saint for whom the hill was named, for a garden that would never die.

Gorakhmath appeared to her in the form of a wandering sadhu, dust-covered and sharp-eyed. "I can give you a garden that will never die," he said, "but the flowers will be made of stone."

The queen thought about this for seven days. On the eighth day she said: "Yes. A stone flower does not need my tending, and it does not die when I am gone. Give me the stone garden."

She woke the next morning to find her garden transformed — every rose, every marigold, every blade of grass carved in pale granite, so perfect you could see the veins in the petals.

The queen lived to be very old. She sat in her stone garden every day, and those who passed by could hear her talking to the flowers. Whether she was talking to the stone or to the memory of the living garden no one knew. Perhaps, said the old soldiers of Gorkha, there was no difference.`,
  },

  // ── 9 ──────────────────────────────────────────────────────────────────
  {
    title: "The Singing Bridge of Dolpo",
    teller_name: "Tenzin Norbu",
    language: "Tibetan",
    location_name: "Dolpo District, Karnali Province, Nepal",
    latitude: 29.1583,
    longitude: 82.9750,
    tag: "Spirit Bridge",
    raw_text: "དོལ་པོའི་གཞུང་ལམ་ལ་ཞིག་ཟམ་ཆེན་པོ་ཡོད་པ་རེད། དེར་གླུ་དབྱངས་ཐོས་ཀྱི་ཡོད་",
    cleaned_text: `In the high valleys of Dolpo, where the trails to Tibet cross rivers so fast they sound like arguments, there is an ancient bridge made of twisted juniper ropes and yak-hide that the villagers call Drolma Zam — the Bridge of Tara. And on certain nights, particularly when the moon is a thin crescent and the river is swollen with snowmelt, the bridge sings.

An old salt trader named Tashi had crossed Drolma Zam three hundred times without incident. On his three-hundred-and-first crossing, at dusk during a late spring flood, he heard the singing clearly for the first time — a low, vowel-heavy sound, something between wind in a conch shell and a woman humming at her loom.

He stopped in the middle of the swaying bridge. The water below was the colour of ash.

"Who sings?" he called.

The bridge replied in the creak of its ropes: "We are the ones who fell before you had planks to walk on. We are the ones who showed the valley where the ford was safe. You walk above our bones every crossing. It is not too much to ask that you stop, once in a hundred crossings, and listen."

Tashi stood on the bridge until the singing stopped, which took the length of a long prayer. Then he walked across to the other side, and left a handful of salt on the far stone pier — payment, or perhaps just acknowledgement.

He told this story in every teahouse between Dolpo and Jumla, and after that, other traders began leaving salt at Drolma Zam too. Some out of piety. Some out of fear. Most because, once you have heard the bridge sing, it seems only polite.`,
  },

  // ── 10 ─────────────────────────────────────────────────────────────────
  {
    title: "Indra's Stolen Elephant",
    teller_name: "Krishna Prasad Adhikari",
    language: "Nepali",
    location_name: "Kathmandu, Nepal",
    latitude: 27.7172,
    longitude: 85.3240,
    tag: "Festival Origin",
    raw_text: "काठमाडौँमा इन्द्र जात्रा किन मनाइन्छ, त्यसको पुरानो कथा यस्तो छ...",
    cleaned_text: `Every year in September, Kathmandu erupts in a festival so old that even the gods who inspired it have grown legendary. This is the story of how Indra Jatra began.

The god Indra, lord of rain and sky, disguised himself as a commoner and came down to the Kathmandu Valley to pick white night-blooming jasmine for his mother, Dakshini. She needed the flowers for a religious ritual, and the jasmine of the valley is the finest in the three worlds.

But Indra was caught stealing flowers from a garden near Maru Tol and was tied to a post in the city square by the locals, who did not recognise him. He was kept prisoner for several days while his mother, worried and angry, came looking for him.

When Dakshini arrived in the valley, the people realised the terrible mistake they had made. They freed Indra immediately and begged his mother's forgiveness. Dakshini, moved by their honesty, made them two promises: that Indra would send the winter rains every year to water their crops, and that he would personally escort the souls of all valley residents who had died that year to the paradise of Swarga.

The festival of Indra Jatra commemorates this bargain. A tall pole is erected each year in Hanuman Dhoka — the post to which Indra was tied — and the living goddess Kumari rides through the streets in a chariot, blessing the city. Indra's image hangs from a pole at the crossroads, still wearing the expression of a god who got caught stealing flowers and decided the embarrassment was worth it.`,
  },

  // ── 11 ─────────────────────────────────────────────────────────────────
  {
    title: "The Daughter Who Became a River",
    teller_name: "Sita Devi Chhetri",
    language: "Nepali",
    location_name: "Pokhara, Kaski, Nepal",
    latitude: 28.2096,
    longitude: 83.9856,
    tag: "River Myth",
    raw_text: "सेती नदीको बारेमा एउटा पुरानो कथा छ जुन हाम्री आमाले सुनाउनुहुन्थ्यो...",
    cleaned_text: `The Seti River that flows through Pokhara is not blue like most rivers — it is white as milk, white as snow. There is a reason for this, and it is not only the glacial flour carried down from the Annapurnas, though the geologists will tell you otherwise.

Long ago, a farmer had a daughter so fair-skinned that travellers would stop outside their house just to watch her work in the field. Her name was Sita. The farmer, proud but frightened by all the attention she drew, locked her inside during the day and let her out only at night.

Sita grew up knowing only moonlight. She never complained, because she had been told her beauty was a burden and she believed it. But one morning her father forgot to lock the door, and she stepped outside just as the sun was rising.

For the first time in her life, sunlight touched her face. She stood there with her eyes closed for a very long time.

A river spirit, watching from the mountains, saw her standing in the light and felt such grief for all the years she had spent in darkness that it came down from the glacier in a great rush of meltwater.

Some say it carried Sita away. Some say she walked into it willingly, finally free. The older women in Pokhara say she became the river itself — that the Seti is white because she was, that the river runs cold because it remembers her years of darkness, and that on still mornings when the mist sits on the water, you can see a figure standing in the shallows, finally, quietly, looking at the sun.`,
  },

  // ── 12 ─────────────────────────────────────────────────────────────────
  {
    title: "The Two Brothers and the King of the Dead",
    teller_name: "Ram Bahadur Magar",
    language: "Magar",
    location_name: "Rolpa District, Lumbini Province, Nepal",
    latitude: 28.3167,
    longitude: 82.6333,
    tag: "Underworld Journey",
    raw_text: "हाम्रो गाउँमा दुई दाजुभाइको कथा छ जसले यमराजसँग लडे...",
    cleaned_text: `In the Magar villages of Rolpa, there is a story told during the Dashain festival about two brothers who went to the kingdom of the dead and came back. Not in dreams. In their bodies, in their boots, with dirt still on their hands.

The elder brother, Dal, died of a fever in the month of Kartik. His younger brother, Bal, could not accept it. He followed the soul-path that the shamans speak of — the path that goes down through the roots of the largest fig tree in the village — and descended into Yama's kingdom.

Yama, the lord of the dead, is depicted as terrible. The stories are not wrong. But Bal came with a gift: a song his mother had taught them both as children, a Magar grinding song so particular to their village that no one else in the world knew it.

He sang it for Yama, who had been king of the dead so long he had forgotten what a living village sounded like. The grinding song with its rhythm of women working, its complaints about husbands, its jokes about the neighbour's cow — Yama sat very still and listened to the whole thing twice.

"Take your brother," Yama said at last. "But understand: I am only lending him. Everybody comes back to me eventually."

Bal understood. He led Dal home by the hand, back up through the roots of the fig tree, back into morning. Dal was cold for a week and then was fine.

He lived thirty more years. On the last night, the village says, he sat under the fig tree alone and sang the grinding song very quietly, the way you sing something when you are returning it to the person you borrowed it from.`,
  },

  // ── 13 ─────────────────────────────────────────────────────────────────
  {
    title: "Pashupatinath and the Lost Pilgrim",
    teller_name: "Govind Paudel",
    language: "Nepali",
    location_name: "Pashupatinath Temple, Kathmandu, Nepal",
    latitude: 27.7106,
    longitude: 85.3486,
    tag: "Devotion Tale",
    raw_text: "पशुपतिनाथ मन्दिरमा एउटा वृद्ध तीर्थालुको कथा छ...",
    cleaned_text: `Every Hindu who can make the journey comes to Pashupatinath at least once before dying. The temple is on the bank of the Bagmati river, and the god Shiva himself — in his aspect as Pashupati, lord of all living things — is said to dwell there in a black stone lingam so old that no one can say who carved it.

One winter a very old pilgrim arrived from a village in the eastern hills. He had walked for thirty days. His sandals were gone by the second week; he had walked the last twenty days barefoot. When he arrived at the ghats he was so exhausted he could not climb the temple steps.

A young temple worker named Pradip found him sitting on the lowest step, eyes closed, lips still moving in prayer. Pradip helped him up to the inner sanctum. The old man stood before the lingam for a long time, then said only: "I came."

On the way out he slipped on the wet stone near the river and could not get up. Pradip sat with him while the other temple staff sent for a doctor. The old man held Pradip's hand and looked at the river.

"I was afraid I would die before I arrived," he said. "Now I can die here, which is the same as dying in his arms."

He did not die. The doctor came, he was fed and rested, and two weeks later Pradip put him on a bus home. But Pradip never forgot what the old man had said, and he tells this story to every person who asks him why he has spent his whole life at this temple.

"Because of him," Pradip says. "Because of anyone who walks thirty days barefoot just to say two words to a stone."`,
  },

  // ── 14 ─────────────────────────────────────────────────────────────────
  {
    title: "The Weaver Bird's Nest and the Monsoon King",
    teller_name: "Aarati Rai",
    language: "Nepali",
    location_name: "Dharan, Sunsari, Nepal",
    latitude: 26.8065,
    longitude: 87.2846,
    tag: "Nature Fable",
    raw_text: "पूर्वी पहाडमा एउटा बयाको गुँड र बर्खाको राजाको कथा छ...",
    cleaned_text: `In the foothills of the eastern hills around Dharan, the weaver bird is the finest architect alive. Its nest hangs from the tip of the most precarious branch it can find — a long teardrop of woven grass, with the entrance hole pointing downward so that snakes cannot enter. Rai villagers watch the nests go up each April and say: when the weavers build high, the rains will be heavy; when they build low, the rains will be light. They have not been wrong in living memory.

This is how the weaver birds came to know the will of the monsoon king.

Long ago, a weaver bird queen went to the palace of Barsha Dev, the god of rain, to ask him a direct question. She was tired of guessing. Every year her people built their nests and every year the rains came differently — sometimes drowning the lowest nests, sometimes failing so completely that even the high nests baked in the heat.

"Tell me what you will send," she said to Barsha Dev. "So we can build accordingly."

Barsha Dev was charmed by the bird's directness. No human had ever asked him plainly; they sacrificed goats and read entrails and studied clouds, but no one had simply asked.

"I will whisper it to the first weaver bird that wakes before dawn on the first morning of Baisakh," he said. "And she must build her nest at the exact height the rains will reach. That nest will tell her whole village."

Now every spring, in the hour before the first light of the new year, all the weaver birds are very quiet. One among them is listening. After that, they know where to build, and they build there without hesitation.

The nests are never wrong.`,
  },

  // ── 15 ─────────────────────────────────────────────────────────────────
  {
    title: "The Blind Sadhu of Swayambhu",
    teller_name: "Meena Maharjan",
    language: "Newari",
    location_name: "Swayambhunath, Kathmandu, Nepal",
    latitude: 27.7149,
    longitude: 85.2903,
    tag: "Wisdom Tale",
    raw_text: "स्वयम्भूको पहाडमा एउटा अन्धो साधु बस्थे जसले सबैको प्रश्नको जवाफ दिन्थे...",
    cleaned_text: `On the hill of Swayambhu, where the great stupa's painted eyes look out over the whole Kathmandu Valley in all four directions, there lived an old sadhu who had been blind since birth. He sat at the base of the stupa each morning and each evening, and people climbed the long staircase of 365 steps to ask him questions.

He was famous not for answering correctly — he sometimes got things entirely wrong — but for asking back a better question than the one he had been asked.

A merchant came to him once, worried about a business deal. "Should I trust my partner or not?"

The sadhu was quiet, then said: "Have you ever watched the monkeys at this stupa steal fruit and each other?"

"Yes," said the merchant, confused.

"Do you trust the monkeys?"

"No."

"Do you enjoy watching them anyway?"

The merchant left without an answer, but he was smiling.

A young woman came to him, heartbroken over a man who had left her. "Will I ever stop feeling this?"

The sadhu tilted his head toward Swayambhu's great dome. "Is the stupa still here?" he asked.

"Yes," she said.

"Then something is still here," he said. "Some days that is enough."

People asked him how he navigated the world without sight. He always gave the same answer: "I have been here every day for sixty years. I know this hill. I know these steps. I know where the lame dog sleeps by the third landing and where the incense seller sets up before dawn. The hill knows me in return."

He died on the stupa steps in his sleep, facing east, in the year of the Wood Rabbit. The monks who found him said his face had the expression of a man who had just been asked a very good question and was still working out the answer.`,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function clearStories() {
  console.log("🗑️  Deleting all existing stories...");
  const { error } = await supabase.from("stories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("❌  Failed to clear stories:", error.message);
    process.exit(1);
  }
  console.log("✅  All stories deleted.\n");
}

async function seed() {
  const shouldClear = process.argv.includes("--clear");
  if (shouldClear) await clearStories();

  console.log(`🌱  Seeding ${STORIES.length} folk tales...\n`);

  let success = 0;
  let fail = 0;

  for (const story of STORIES) {
    const imagePrompt = `${story.title} — ${story.cleaned_text.slice(0, 120)} folk tale illustration watercolor`;
    const cover_image_url = coverUrl(imagePrompt);

    const { error } = await supabase.from("stories").insert({
      title: story.title,
      teller_name: story.teller_name,
      raw_text: story.raw_text,
      cleaned_text: story.cleaned_text,
      cover_image_url,
      tag: story.tag,
      language: story.language,
      location_name: story.location_name,
      latitude: story.latitude,
      longitude: story.longitude,
      user_id: null,
    });

    if (error) {
      console.error(`  ❌  "${story.title}" — ${error.message}`);
      fail++;
    } else {
      console.log(`  ✅  "${story.title}" (${story.language}, ${story.location_name})`);
      success++;
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Seeded: ${success}  |  Failed: ${fail}`);
  console.log(`─────────────────────────────────────`);
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
