import { createOptimizedPicture, lookupPages, readBlockConfig } from '../../scripts/scripts.js';


function createSpeakerCard(speaker) {
  const card = document.createElement('li');
  card.className = `speaker-card`;

  const {name} = speaker;
  const {position} = speaker;
  const {bio} = speaker;
  const picture = createOptimizedPicture(speaker.image, name, false, [{ width: 80 }]).outerHTML;

  card.innerHTML = `<div class="speaker-image">${picture}</div>
  <div class="speaker-name">${name}</div>
  <p class="speaker-position">${position}</p>
  <p class="speaker-bio">${bio}</p>`;
  return (card);
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  let {speakers} = config;
  block.innerHTML = '';

  if (speakers) {
    speakers = speakers.split(',').map((speaker) => speaker.trim());

    const collection = 'speakers';
    await lookupPages([], collection);
    const allSpeakers = window.pageIndex[collection].data;

    const ul = document.createElement('ul');
    speakers.forEach((speakerName) => {
      const speakerData = allSpeakers.filter((e) => e.name.toLowerCase().includes(speakerName.toLowerCase()))[0];
      const speakerCard = createSpeakerCard(speakerData);
      ul.append(speakerCard);
    });

    block.innerHTML = ul.outerHTML;
  }
}
