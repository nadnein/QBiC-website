fetch('/wp-content/research-custom/data/papersData.json')
    .then(res => res.json())
      .then(papers => {
        const maxNumberOfAuthors = 20; //how many authors are maximally displayed per paper


        const container = document.getElementById('papers-grid');
        const searchBox = document.getElementById('search-box');
        const yearFilterButton = document.getElementById('year-filter-button');
        const list = document.getElementById('year-filter-list');
        const options = list.querySelectorAll('li');

        const downloadButton = document.getElementById('download-button');
        const downloadMenu = document.getElementById('download-menu');
        const downloadJsonButton = document.getElementById('download-json');
        const downloadCsvButton = document.getElementById('download-csv');

        let filteredPapers = papers;
        let filteredYear = 'All';
        let filteredSearch = '';

        //Unifies the format of the author names to display the last name and the initials of all other names
        function formatAuthorName(fullName) {
          const parts = fullName.trim().split(/\s+/);
          if (parts.length === 0) {
              return '';
          }
          const lastName = parts[parts.length - 1];
          const initials = parts.slice(0, parts.length - 1)
                                .map(part => part.charAt(0) + '.')
                                .join(' ');
          return initials ? `${initials} ${lastName}` : lastName;
        }


        function renderPapers(list) {
          container.innerHTML = '';
          if (list.length === 0) {
            container.innerHTML = '<p>No papers found.</p>';
            return;
          }

          //a paper-card is created, filled with metadata and added to the grid
          list.forEach(p => {
            const div = document.createElement('div');
            div.className = 'paper-card';

            // Format author names
            let authorsFormatted = '';
            let first = true;
            for (let i = 0; i < Math.min(p.authors.length, maxNumberOfAuthors); i++) {
              if (first) {
                authorsFormatted += formatAuthorName(p.authors[i]);
                first = false;
              }
              else {
                authorsFormatted += ', ' + formatAuthorName(p.authors[i]);
              }
            }
            if (p.authors.length > maxNumberOfAuthors){
              authorsFormatted += ', ...'
            }

            //format journal, volume, issue, publisher
            const issueText = p.issue ? `, Issue ${p.issue}` : '';
            const journalLine = p.journal ? `In ${p.journal} (Vol. ${p.volume}${issueText}).\n${p.publisher}.` : p.publisher ? `${p.publisher}.` : '';

            // 1. Create the container div for the paper card's visual styling (including the shadow)
            const paperCardContainer = document.createElement('div');
            paperCardContainer.classList.add('paper-card');
            // Crucial for positioning the absolute link correctly within the card
            paperCardContainer.style.position = 'relative';

            // 2. Create the inner link element that will cover the entire card for clicking
            const linkElement = document.createElement('a');
            linkElement.href = p.url; 
            linkElement.target = '_blank'; 
            linkElement.rel = 'noopener noreferrer';

            // Style the link to span the entire area of its parent .paper-card div
            linkElement.style.position = 'absolute';
            linkElement.style.top = '0';
            linkElement.style.left = '0';
            linkElement.style.width = '100%';
            linkElement.style.height = '100%';
            linkElement.style.zIndex = '1'; // Ensure the link is on top for clicking
            linkElement.style.textDecoration = 'none';
            linkElement.style.color = 'inherit';

            // 3. Set the HTML content directly into the paperCardContainer
            // The linkElement will be a transparent overlay on top of this content.
            paperCardContainer.innerHTML = `
                <div class="paper-title">${p.title}</div>
                <div class="paper-detail authors">${authorsFormatted} (${p.year}).</div>
                <div class="paper-detail journal-info">${journalLine}</div>
            `;

            // 4. Append the transparent link overlay *after* the content, so it sits on top for clicks
            paperCardContainer.appendChild(linkElement);

            // 5. Append the whole paperCardContainer (div with content and overlay link) to your main container
            container.appendChild(paperCardContainer);
          });
        }


        function filterPapers() {
          filteredPapers = papers.filter(p =>
            p.title.toLowerCase().includes(filteredSearch) ||
            (Array.isArray(p.authors) ? p.authors.join(', ').toLowerCase().includes(filteredSearch) : false) ||
            p.journal.toLowerCase().includes(filteredSearch) ||
            String(p.year).includes(filteredSearch)
          );
          if (filteredYear != 'All'){
            filteredPapers = filteredPapers.filter(p => String(p.year) === filteredYear);
          }
        }

        //search function - filtering the papers by the query - predicate: String(p.year).includes(q)
        function filterPapersSearch(query) {
          filteredSearch = query.toLowerCase();
          filterPapers();
          renderPapers(filteredPapers);
        }
        searchBox.addEventListener('input', e => {
          filterPapersSearch(e.target.value);
        });


        //year filter button logic
        function filterPapersYear(year) {
          filteredYear = year;
          filterPapers();
          renderPapers(filteredPapers);
        }
        // year filter button open listener
        yearFilterButton.addEventListener('click', () => {
          const expanded = yearFilterButton.getAttribute('aria-expanded') === 'true';
          yearFilterButton.setAttribute('aria-expanded', !expanded);
          list.hidden = expanded;
          list.classList.toggle('show', !expanded);
        });

        // year filter button listener for closing
        document.addEventListener('click', (e) => {
          if (!document.getElementById('year-filter-wrapper').contains(e.target)) {
            list.hidden = true;
            list.classList.remove('show');
            yearFilterButton.setAttribute('aria-expanded', 'false');
          }
        });

        // Handle option selection of year filter button
        options.forEach(option => {
          option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            yearFilterButton.childNodes[0].nodeValue = value; // update label text
            list.querySelectorAll('[aria-selected="true"]').forEach(el => el.removeAttribute('aria-selected'));
            option.setAttribute('aria-selected', 'true');
            yearFilterButton.setAttribute('aria-expanded', 'false');
            list.hidden = true;
            list.classList.remove('show');
            filterPapersYear(value);
          });
        });


        function jsonToCSV(jsonArray) {
          if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
            return '';
          }

          // Get CSV headers from object keys
          const headers = Object.keys(jsonArray[0]);
          const separator = ';';

          const csvRows = [];

          // Add header row
          csvRows.push(headers.join(separator));

          // Add data rows
          for (const obj of jsonArray) {
            const row = headers.map(header => {
              let value = obj[header];

              // Flatten authors array
              if (header === 'authors' && Array.isArray(value)) {
                value = value.join('; ');
              }

              // Escape double quotes by doubling them
              value = String(value ?? '').replace(/"/g, '""');

              // Wrap in quotes if value contains separator, quotes, or newline
              if (/[;"\n]/.test(value)) {
                value = `"${value}"`;
              }

              return value;
            });

            csvRows.push(row.join(separator));
          }

          return csvRows.join('\n');
        }


        function downloadCSVFiltered() {
          const csvContent = jsonToCSV(filteredPapers);
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'papersData.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          URL.revokeObjectURL(url);
        }

        function downloadJsonFiltered() {
          const blob = new Blob([JSON.stringify(filteredPapers, null, 2)], { type: 'application/json;charset=utf-8;' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'papersData.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          URL.revokeObjectURL(url);
        }

        downloadJsonButton.addEventListener('click', () => {
          downloadJsonFiltered();
          downloadMenu.style.display = 'none'; // Hide menu after click
        });


        downloadCsvButton.addEventListener('click', () => {
          downloadCSVFiltered();
          downloadMenu.style.display = 'none'; // Hide menu after click
        });

        downloadButton.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevents the window click listener from closing the menu
          const isDisplayed = downloadMenu.style.display === 'block';
          downloadMenu.style.display = isDisplayed ? 'none' : 'block';
        });

        /**
         * Hides the menu if a click occurs anywhere outside of it.
         */
        window.addEventListener('click', () => {
          if (downloadMenu.style.display === 'block') {
            downloadMenu.style.display = 'none';
          }
        });

        //download json button listener
        downloadJsonButton.addEventListener('click', () => {
          downloadJson();
        })


        renderPapers(papers);
      })
      .catch(err => {
        document.getElementById('papers-grid').innerHTML = '<p>Failed to load papers.</p>';
        console.error(err);
      });