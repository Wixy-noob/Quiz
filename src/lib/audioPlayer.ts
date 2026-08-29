/**
 * Audio Player utility for Gemini TTS (24kHz PCM / Audio)
 */
export class AudioNarrationPlayer {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  public async playBase64Pcm(
    base64Pcm: string,
    sampleRate: number = 24000,
    onVisualizerUpdate?: (frequencyData: number[]) => void,
    onEnded?: () => void
  ): Promise<void> {
    this.stop();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass({ sampleRate });
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    // Decode base64 to binary
    const binary = atob(base64Pcm);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert 16-bit PCM little-endian to Float32Array
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Create AudioBuffer
    const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;

    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.currentSource = source;
    this.isPlaying = true;

    source.onended = () => {
      this.isPlaying = false;
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (onEnded) onEnded();
    };

    source.start(0);

    // Visualizer loop
    if (onVisualizerUpdate && this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const updateLoop = () => {
        if (!this.isPlaying || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        const normalized = Array.from(dataArray.slice(0, 16)).map((v) => v / 255);
        onVisualizerUpdate(normalized);
        this.animFrameId = requestAnimationFrame(updateLoop);
      };
      this.animFrameId = requestAnimationFrame(updateLoop);
    }
  }

  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignored
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const globalAudioPlayer = new AudioNarrationPlayer();
