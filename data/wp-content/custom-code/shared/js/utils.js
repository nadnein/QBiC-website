/*
This function is for keeping the mailto out of the DOM until someone actually clicks on a email-link class object.
When the Mail icon is clicked the script is triggered and decodes the base 64 encrypted mail saved in the data-encoded-mail attribute of the object.
Then the actual mailto link is created and clicked.

The script keeps most scraper bots from immediately recognising emails.
*/
export function attachEmailHandlers(){
        document.querySelectorAll('.email-link[data-encoded-mail]').forEach(link => {
            link.addEventListener('click', event => {
                if (!link.dataset.decoded) {
                    event.preventDefault();
                    const encodedMail = link.getAttribute('data-encoded-mail');
                    const decodedEmail = atob(encodedMail);
                    link.href = `mailto:${decodedEmail}`;
                    link.dataset.decoded = "true"; // mark as decoded
                    link.click();
                }
            });
        })
};

