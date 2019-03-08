"use strict";

const githubApiURL = "https://api.github.com";

window.addEventListener(`load`, async () => {
    initForm();
});

function initForm() {
    const butnElement = document.getElementById("submit");
    butnElement.addEventListener("click", async () => {
        const nameElement = document.getElementById("name");
        const name      = nameElement.value;
        const result    = await fetch(`${githubApiURL}/users/${name}/repos?per_page=100`);
        const repoList  = await result.json();
        
        //User does not exist
        if (repoList.message) {
            return;
        }
        
        //User does exist
        const repoInfo = [];
        for (const repo of repoList) {
            repoInfo.push({
                name: repo.name,
                issues: repo.open_issues_count,
                stars: repo.stargazers_count
            });
        }
        repoInfo.sort((a, b) => {
            return b.issues - a.issues;
        });
        const repoListElement = document.getElementById("repoList");
        for (let i = 0; i < Math.min(repoInfo.length, 10); i++) {
            const temp = document.getElementById("repo-info");
            const clone = document.importNode(temp.content, true);
            const elements = 
                clone.querySelector   ("a")
                     .querySelectorAll("p");
            console.log(elements);
            const repo = repoInfo[i];
            elements[0].textContent = `Name: ${repo.name}`;
            elements[1].textContent = `Open Issues: ${repo.issues}`;
            elements[2].textContent = `Stargazers: ${repo.stars}`;
            repoListElement.appendChild(clone);
        }
    });
}

async function getrepos() {
    console.log("test");
}

