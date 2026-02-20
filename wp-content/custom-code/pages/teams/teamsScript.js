// Import helper that attaches click handlers to encoded email links
import { attachEmailHandlers } from "/wp-content/custom-code/shared/js/utils.js";

// Base paths for data and assets
const dataLocation = "/wp-content/custom-code/data";
const peopleImagesLocation = `${dataLocation}/images/people`;
const teamsDataLocation = `${dataLocation}/json/teamsData.json`;


/**
 * Fetch team data (JSON) from the given path
 * @param {string} pathname - Path to JSON file
 * @returns {Object} Parsed JSON data
 */
async function fetchTeams(pathname) {
  const res = await fetch(pathname);
  const data = await res.json();
  return data;
}


/**
 * Render all teams and members dynamically into #teams container
 * @param {string} pathname - Path to JSON file
 */
async function displayTeams(pathname) {
    const teams = await fetchTeams(pathname);

    const teamsDiv = document.getElementById('teams');
    teamsDiv.innerHTML = ''; // Clear container before rendering

    // Loop through each team
    for (const [teamId, teamObject] of Object.entries(teams)) {

        const teamDiv = document.createElement('div');
        teamDiv.id = teamId;
        teamDiv.classList.add('team');

        // Team name
        const teamName = document.createElement('p');
        teamName.classList.add('team-name');
        teamName.textContent = teamObject.name;
        teamDiv.appendChild(teamName);

        // Team description (only if it exists)
        if (teamObject.description) {
            const teamDescription = document.createElement('p');
            teamDescription.classList.add('team-description');
            teamDescription.textContent = teamObject.description;
            teamDiv.appendChild(teamDescription);
        }

        // Grid container for members
        const membersDiv = document.createElement('div');
        membersDiv.classList.add('team-grid');

        // Loop through each member of the team
        for (const [memberId, memberObject] of Object.entries(teamObject.members)) {

            const memberDiv = document.createElement('div');
            memberDiv.classList.add('team-member');
            memberDiv.id = memberId;

            // Optional: allow manual grid break positioning via JSON
            if ('break' in memberObject) {
                memberDiv.style.gridColumnStart = memberObject.break;
            }

           // Create member image
            const memberImage = document.createElement('img');
            memberImage.classList.add('member-image');

            const basePath = `${peopleImagesLocation}/${memberObject.image}`;
            const placeholder = `${peopleImagesLocation}/templateMember.jpg`;

            // Order: webp first, then other allowed formats
            const exts = ['webp', 'jpg', 'jpeg', 'png'];
            let i = 0;

            const tryNext = () => {
                if (i < exts.length) {
                    memberImage.src = `${basePath}.${exts[i++]}`;
                } else {
                    memberImage.onerror = null; // prevent loops
                    memberImage.src = placeholder;
                }
            };

            memberImage.onerror = tryNext;
            tryNext(); // kick off with webp

            memberImage.alt = memberObject.name;
            memberDiv.appendChild(memberImage);

            // Member name
            const memberName = document.createElement('p');
            memberName.classList.add('member-name');
            memberName.textContent = memberObject.name;
            memberDiv.appendChild(memberName);

            // Member title
            const memberTitle = document.createElement('p');
            memberTitle.classList.add('member-title');
            memberTitle.textContent = memberObject.title;
            memberDiv.appendChild(memberTitle);

            // Email wrapper
            const mailDiv = document.createElement('div');
            mailDiv.classList.add("email-wrapper");

            const mailLink = document.createElement('a');
            mailLink.classList.add('email-link');
            mailLink.setAttribute('aria-label', 'email');
            mailLink.setAttribute('data-encoded-mail', memberObject.mail);

            const mailIcon = document.createElement('span');
            mailIcon.classList.add('material-symbols-outlined');
            mailIcon.textContent = "mail";

            mailLink.appendChild(mailIcon);
            mailDiv.appendChild(mailLink);
            memberDiv.appendChild(mailDiv);

            membersDiv.appendChild(memberDiv);
        }

        teamDiv.appendChild(membersDiv);
        teamsDiv.appendChild(teamDiv);
    }
}


/**
 * Main entry point
 * Loads teams and activates email decoding/handling
 */
async function main() {
    await displayTeams(teamsDataLocation);
    attachEmailHandlers();
}

// Run script once DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    main();
});