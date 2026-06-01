window.TOPICS_DATA = window.TOPICS_DATA || [];

TOPICS_DATA.push({
  phase: "s8", pLabel: "PHASE 2 · Ôn S8", pClass: "pb-s8",
  tag: "S8", name: "Storage",
  desc: "Storage in Docker, Volume Modes, Volumes (hostPath/emptyDir/configMap/secret), PersistentVolumes (accessModes: RWO/ROX/RWX, reclaimPolicy: Retain/Delete/Recycle), PersistentVolumeClaims (binding lifecycle), StorageClasses (dynamic provisioning, volumeBindingMode: WaitForFirstConsumer).",
  hints: ["PVC không bind được PV","accessModes RWO vs RWX","StorageClass WaitForFirstConsumer"],
});
