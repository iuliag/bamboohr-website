import { buildBlock, getMetadata, createOptimizedPicture } from './scripts.js';

function buildSuccessThanks(main) {
  const imageSrc = getMetadata('og:image');
  const webinarTitle = getMetadata('og:title').split(' | ')[0];
  const thumbImg = createOptimizedPicture(imageSrc, webinarTitle, false, [{ width: '700' }]);
  const columnData = [];


  columnData.push(`<h1>Thanks for registering!</h1><p>You should receive an email with the details.</p>`);
  columnData.push(thumbImg);

  if (columnData.length > 0) {
    const section = document.createElement('div');
    const columns = buildBlock('columns', [columnData]);
    columns?.classList?.add('6-6', 'title1-heading', 'hero-subhead', 'image-round-corners', 'image-shadow', 'live-demo-webinar-thanks', 'content-width-md');
    section.prepend(columns);
    main.prepend(section);
  }
}

function buildSuccessJoinCommunity(main) {
  const title = 'Join the HR Heroes Slack Community';

  const titleBlock = buildBlock('title', title);
  titleBlock?.classList.add('section-header', 'color-gray-12', 'join-community-title');
  titleBlock?.querySelector('div').setAttribute('data-align', 'center');

  main.querySelector('.live-demo-webinar-thanks')?.after(titleBlock);

  const subheading = 'If you think chatting with your peers in a webinar is great you should try it in our Slack Community!';
  const subheadingBlock = buildBlock('title', subheading);
  subheadingBlock?.classList.add('section-subhead', 'color-gray-12', 'join-community-subheading');
  subheadingBlock?.querySelector('div').setAttribute('data-align', 'center');

  main.querySelector('.join-community-title')?.after(subheadingBlock);

  const joinCommunityBtn = '<a href="https://join.slack.com/t/hrheroesworkspace/shared_invite/zt-1imk9fc2a-GSWqro2M1U3U77Fj6xClOA" title="Join the Community Now" alt="Join the Community Now" class="button accent" target="_blank">Join the Community Now</a>';
  const joinCommunityBtnBlock = buildBlock('title', joinCommunityBtn);
  joinCommunityBtnBlock?.classList.add('button-color-shade-5', 'join-community-btn');
  joinCommunityBtnBlock?.querySelector('div').setAttribute('data-align', 'center');
  main.querySelector('.join-community-subheading')?.after(joinCommunityBtnBlock);
}

function buildSuccessMore(main) {
  const title = 'Want even more from BambooHR?';

  const titleBlock = buildBlock('title', title);
  titleBlock?.classList.add('title1', 'color-gray-12', 'want-more-title');
  titleBlock?.querySelector('div').setAttribute('data-align', 'center');

  main.querySelector('.join-community-btn')?.after(titleBlock);

  const moreData = [];
  moreData.push(`<img src="/icons/rocketship.svg" alt="rocketship icon" /><h4>Performance Management</h4><p>Get real results with more frequent communication, meaningful feedback, and valuable insights.</p><p class="button-container"><a href="https://www.bamboohr.com/expansion/performance-management/" title="Learn more about Performance Management" class="button accent">Learn More</a></p>`);
  moreData.push(`<img src="/icons/calendar-clock.svg" alt="calendar clock icon" /><h4>Time Tracking</h4><p>Make time entry, timesheet management, and reporting a breeze for employees and managers alike.</p><p class="button-container"><a href="https://www.bamboohr.com/expansion/time-tracking-software/" title="Learn more about Time Tracking" class="button accent">Learn More</a></p>`);
  moreData.push(`<img src="/icons/advantage.svg" alt="advantage icon" /><h4>Upgrade to Advantage</h4><p>Unlock all the tools you need to tackle the strategic challenges of your growing organization.</p><p class="button-container"><a href="https://www.bamboohr.com/expansion/advantage/" title="Learn more about Upgrade to Advantage" class="button accent">Learn More</a></p>`);
  moreData.push(`<img src="/icons/money.svg" alt="money icon" /><h4>Payroll</h4><p>Pay your people accurately, save valuable time, and preserve your sanity all at once.</p><p class="button-container"><a href="https://www.bamboohr.com/expansion/payroll/" title="Learn more about Payroll" class="button accent">Learn More</a></p>`);

  if (moreData.length > 0) {
    const moreBlock = buildBlock('columns', [moreData]);
    moreBlock?.classList?.add('style-4-columns', 'button-style-link', 'want-more-columns');
    main.querySelector('.want-more-title')?.after(moreBlock);
  }
}

export default async function decorateTemplate(main) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const formSubmit = urlParams.get('formSubmit');

  if (formSubmit && formSubmit === 'success') {
    main.innerHTML = '';
    document.body.classList.add('live-demo-webinar-lp-success');
    buildSuccessThanks(main);
    buildSuccessJoinCommunity(main);
    buildSuccessMore(main);
  }
}