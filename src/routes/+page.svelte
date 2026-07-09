<script lang="ts">
  import PhaserGame, { type TPhaserRef } from "../PhaserGame.svelte";

  let phaserRef: TPhaserRef = { game: null, scene: null };
</script>

<div id="app">
  <PhaserGame bind:phaserRef />
</div>

<style>
  #app {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
