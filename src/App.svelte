<script lang="ts">
  import { onMount } from "svelte";
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import { requestCurrentYoutubeUser } from "./util/youtube";
  import { getPairingForUser, updatePairing } from "./util/storage";

  let tt_user = "";
  let yt_user = "";
  async function handleButtonClick() {
    await updatePairing(yt_user, tt_user);
  }

  async function fillCurrentPage() {
    try {
      const currentYTUser = await requestCurrentYoutubeUser();
      yt_user = currentYTUser;
      const pagePairing = await getPairingForUser(yt_user);
      if (!pagePairing) return;

      await updatePairing(yt_user, tt_user);
      tt_user = pagePairing;
    } catch (err) {
      //TODO: Catch error
    }
  }
  async function setYtInfo() {
    let responese = await requestCurrentYoutubeUser();
    if (responese) yt_user = responese;
  }
  onMount(() => {
    fillCurrentPage();
  });
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    TT: <input bind:value={tt_user} />
    YT: <input bind:value={yt_user} />
    <button on:click={handleButtonClick}>Submit</button>
  </div>
  <div class="card">
    <button on:click={setYtInfo}>Current User</button>
  </div>

  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
