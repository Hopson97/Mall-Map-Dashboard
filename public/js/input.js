"use strict";

const githubApiURL = "https://api.github.com";

window.addEventListener(`load`, async () => {
    initForm();
    fetchRepositories("Hopson97");
});

function clearChildren(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

function initForm() {
    const butnElement = document.getElementById("submit");
    butnElement.addEventListener("click", async () => {
        const nameElement   = document.getElementById("name");
        const name          = nameElement.value;
        
        fetchRepositories(nameElement.value);
    });
}

async function fetchRepositories(githubUser) {
    const result    = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100`);
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
            stars: repo.stargazers_count,
            url: repo.html_url,
            api: repo.url,
        });
    }
    repoInfo.sort((a, b) => {
        return b.issues - a.issues;
    });
    const repoListElement = document.getElementById("repoList");
    clearChildren(repoListElement);
    for (let i = 0; i < Math.min(repoInfo.length, 10); i++) {
        const temp = document.getElementById("repo-info");
        const clone = document.importNode(temp.content, true);
        const container = clone.querySelector("div");
        const elements  = container.querySelector("div")
                                   .querySelectorAll("p");
        container.id = `repo-idx${i}`;
        const repo = repoInfo[i];
        elements[0].textContent = `${repo.name}`;
        elements[1].textContent = `${repo.issues} Issues • ${repo.stars} Stars`;
        repoListElement.appendChild(clone);
        container.url = repo.url;
        console.log(container.url);
        container.addEventListener("click", async (event) => {
            const element = event.target;
            window.open(element.url);
        });
    }
}