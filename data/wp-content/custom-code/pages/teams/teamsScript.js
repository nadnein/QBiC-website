import { attachEmailHandlers } from "./utils.js";

async function fetchTeams (pathname) {
  const res = await fetch(pathname);
  const data = await res.json();
  return data;
}

async function displayTeams (pathname) {
    const teams = await fetchTeams(pathname);
    const teamsDiv = document.getElementById('teams')
    teamsDiv.innerHTML = '';

    for (const [teamId, teamObject] of Object.entries(teams)) {
        const teamDiv = document.createElement('div');
        teamDiv.id = `${teamId}`
        teamDiv.classList.add('team')

        const teamName = document.createElement('p')
        teamName.classList.add('team-name')
        teamName.textContent = teamObject.name
        teamDiv.appendChild(teamName)

        const teamDescription = document.createElement('p')
        teamDescription.classList.add('team-description') 
        teamDescription.textContent = teamObject.description 
        teamDiv.appendChild(teamDescription)

        const membersDiv = document.createElement('div')
        membersDiv.classList.add('team-grid')
        for (const [memberId, memberObject] of Object.entries(teamObject.members)) {
            const memberDiv = document.createElement('div')
            memberDiv.classList.add('team-member')
            memberDiv.id = `${memberId}`

            const memberImage = document.createElement('img')
            memberImage.classList.add('member-image')
            memberImage.src = `data/photos/${memberObject.image}.jpg`
            memberImage.alt = memberObject.name
            memberDiv.appendChild(memberImage)

            const memberName = document.createElement('p')
            memberName.classList.add('member-name')
            memberName.textContent = memberObject.name
            memberDiv.appendChild(memberName)

            const memberTitle = document.createElement('p')
            memberTitle.classList.add('member-title')
            memberTitle.textContent = memberObject.title
            memberDiv.appendChild(memberTitle)

            const mailDiv = document.createElement('div')
            mailDiv.classList.add("email-wrapper")

            const mailLink = document.createElement('a')
            mailLink.classList.add('email-link')
            mailLink.setAttribute('aria-label', 'email');
            mailLink.setAttribute('data-encoded-mail', memberObject.mail);

            const mailIcon = document.createElement('span')
            mailIcon.classList.add('material-symbols-outlined')
            mailIcon.textContent = "mail"
            mailLink.appendChild(mailIcon)

            mailDiv.appendChild(mailLink)

            memberDiv.appendChild(mailDiv)
            
            membersDiv.appendChild(memberDiv)
        }
        teamDiv.appendChild(membersDiv)

        teamsDiv.appendChild(teamDiv)
    }
}


async function main() {
    await displayTeams("data/teamsData.json");
    attachEmailHandlers();
}

document.addEventListener("DOMContentLoaded", function() {
    main()
})

