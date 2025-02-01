/* Video Player Theme */
interface VideoPlayerTheme{
    backgroundColor?: string,
    textColor?: string,
    iconColor?: string,
    sliderColor?: string
};

/* Video Player Options */
interface VideoPlayerOptions{
    container: HTMLElement,
    src: string
    theme?: VideoPlayerTheme,
    autoPlay?: boolean,
    controls?: boolean,
    loop?: boolean,
    muted?: boolean
}

/* Custom Video Player */
export class CustomVideoPlayer{
    private options: VideoPlayerOptions;
    private container: HTMLElement;
    private videoElement: HTMLVideoElement;
    private controlsContainer!: HTMLDivElement;
    private playPauseIcon!: HTMLElement;
    private volumeIcon!: HTMLElement;
    private progressBar!: HTMLInputElement;
    private volumeSlider!: HTMLInputElement;
    private currentTimeDisplay!: HTMLSpanElement;
    private durationDisplay!: HTMLSpanElement;
    private previousVolume: number = 1;

    constructor(options: VideoPlayerOptions){

        if(!options.container){
            throw new Error("Container Is Required");
        }
        if(!options.src){
            throw new Error("Video Source Is Required");
        }

        this.options = options;
        this.container = options.container;
        this.container.style.position = "relative";

        // Add Title (h1) Above the Video Player
        const titleContainer = document.createElement("div");
        titleContainer.style.textAlign = "center";
        titleContainer.style.marginBottom = "10px"; 

        const title = document.createElement("h1");
        title.textContent = "Video Player";
        title.style.color = "#B5828C";
        titleContainer.appendChild(title);

        // Add title container above the video element
        this.container.appendChild(titleContainer);

        document.addEventListener("fullscreenchange", () => {
            if (document.fullscreenElement) {
                // لو في fullscreen، أخفي العنوان
                titleContainer.style.display = "none";
            } else {
                // لو خرجنا من fullscreen، خلي العنوان يظهر تاني
                titleContainer.style.display = "block";
            }
        });

        // Video Element Create
        this.videoElement = document.createElement("video");
        this.videoElement.src = options.src;
        this.videoElement.style.width = "100%";
        this.videoElement.style.display = "block";

        if(options.autoPlay){
            this.videoElement.autoplay = true;
        }
        if(options.loop){
            this.videoElement.loop = true;
        }
        if (options.muted) {
            this.videoElement.muted = true;
        }

        // Hide Default Video Element Controls
        this.videoElement.controls = false; 

        // Append Video Element In container
        this.container.appendChild(this.videoElement);

        // Add Custom Controls
        if(options.controls !== false){
            this.createControls();
        }

        this.videoElement.addEventListener("play", () => {
            this.playPauseIcon.className = "fa fa-pause";
        });
        this.videoElement.addEventListener("pause", () => {
            this.playPauseIcon.className = "fa fa-play";
        });

        if (options.autoPlay) {
            if (!this.videoElement.paused) {
                this.playPauseIcon.className = "fa fa-pause";
            }
        }    

        // Add Custom Theme
        if(options.theme) {
            this.applyTheme(options.theme);
        }
    }

    // Custom Controls Function
    private createControls():void{
        this.controlsContainer = document.createElement("div");
        Object.assign(this.controlsContainer.style, {
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "10px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        });

        // Add Icons Contianer
        const iconsContainer = document.createElement("div");
        iconsContainer.style.display = "flex";
        iconsContainer.style.justifyContent = "center";
        iconsContainer.style.gap = "20px";

        const createIcon = (iconClass: string, clickHandler: () => void): HTMLElement => {
            const icon = document.createElement("i");
            icon.className = iconClass;
            icon.style.cursor = "pointer";
            icon.style.fontSize = "20px";
            icon.addEventListener("click", clickHandler);
            return icon;
        };

        // Play & Pause Icon
        this.playPauseIcon = document.createElement("i");
        this.playPauseIcon.className = "fa fa-play";
        this.playPauseIcon.style.cursor = "pointer";
        this.playPauseIcon.style.fontSize = "20px";
        this.playPauseIcon.addEventListener("click", () => {
            if (this.videoElement.paused) {
                this.videoElement.play();
                this.playPauseIcon.className = "fa fa-pause";
            } else {
                this.videoElement.pause();
                this.playPauseIcon.className = "fa fa-play";
            }
        });
        iconsContainer.appendChild(this.playPauseIcon);
       
        // Stop Icon
        const stopIcon = createIcon("fa fa-stop", () => {
            this.stop();
            this.playPauseIcon.className = "fa fa-play"; 
        });
        iconsContainer.appendChild(stopIcon);

        // Backward Icon
        const backwardIcon = createIcon("fa fa-backward", () => this.seekBackward(10));
        iconsContainer.appendChild(backwardIcon);

        // Forward Icon
        const forwardIcon = createIcon("fa fa-forward", () => this.seekForward(10));
        iconsContainer.appendChild(forwardIcon);

        // FullScreen Icon
        const fullScreenIcon = createIcon("fa fa-expand", () => this.toggleFullScreen());
        iconsContainer.appendChild(fullScreenIcon);

        // Time Progress Container
        const progressContainer = document.createElement("div");
        progressContainer.style.display = "flex";
        progressContainer.style.alignItems = "center";
        progressContainer.style.gap = "10px";

        // Current time
        this.currentTimeDisplay = document.createElement("span");
        this.currentTimeDisplay.textContent = "0:00";
        this.currentTimeDisplay.style.fontWeight = "bold";
        this.currentTimeDisplay.style.minWidth = "40px";
        progressContainer.appendChild(this.currentTimeDisplay);

        // Progress Time Bar (Slider)
        this.progressBar = document.createElement("input");
        Object.assign(this.progressBar, { 
            type: "range", 
            min: "0", 
            max: "100", 
            value: "0" 
        });
        this.progressBar.style.flexGrow = "1";
        this.progressBar.addEventListener("input", () => {
            this.seekToPercentage(parseFloat(this.progressBar.value));
        });
        progressContainer.appendChild(this.progressBar);

        // Total time
        this.durationDisplay = document.createElement("span");
        this.durationDisplay.textContent = "0:00";
        this.durationDisplay.style.fontWeight = "bold";
        this.durationDisplay.style.minWidth = "40px";
        progressContainer.appendChild(this.durationDisplay);

        // Volumne Progress Container
        const volumeContainer = document.createElement("div");
        volumeContainer.style.display = "flex";
        volumeContainer.style.alignItems = "center";
        volumeContainer.style.justifyContent = "center";
        volumeContainer.style.gap = "10px";

        const volumeLabel = document.createElement("span");
        volumeLabel.textContent = "Volume:";
        volumeContainer.appendChild(volumeLabel);

        // Volumne Icon
        this.volumeIcon = document.createElement("i");
        this.volumeIcon.className = "fa fa-volume-up";
        this.volumeIcon.style.cursor = "pointer";
        this.volumeIcon.style.fontSize = "20px";
        volumeContainer.appendChild(this.volumeIcon);

        // Progress Volumne Bar (Slider)
        this.volumeSlider = document.createElement("input");
        Object.assign(this.volumeSlider, { 
            type: "range", 
            min: "0", 
            max: "1", 
            step: "0.01", 
            value: this.videoElement.volume.toString() 
        });
        this.volumeSlider.style.width = "100px";
        this.volumeSlider.addEventListener("input", () => {
            const vol = parseFloat(this.volumeSlider.value);
            this.setVolume(vol);
            if (vol === 0) {
                this.volumeIcon.className = "fa fa-volume-mute";
            } else {
                this.volumeIcon.className = "fa fa-volume-up";
            }
        });
        volumeContainer.appendChild(this.volumeSlider);

        this.volumeIcon.addEventListener("click", () => {
            if (parseFloat(this.volumeSlider.value) > 0) {
                this.previousVolume = parseFloat(this.volumeSlider.value);
                this.setVolume(0);
                this.volumeSlider.value = "0";
                this.volumeIcon.className = "fa fa-volume-mute";
            } else {
                this.setVolume(this.previousVolume);
                this.volumeSlider.value = this.previousVolume.toString();
                this.volumeIcon.className = "fa fa-volume-up";
            }
        });

        // Add All Icons Into Custom Controls Container
        this.controlsContainer.appendChild(iconsContainer);
        this.controlsContainer.appendChild(progressContainer);
        this.controlsContainer.appendChild(volumeContainer);

        // Add Custom Controls To Main Container
        this.container.appendChild(this.controlsContainer);

        // Show Current Time On video
        this.videoElement.addEventListener("timeupdate", () => this.updateProgress());
        this.videoElement.addEventListener("loadedmetadata", () => {
            this.durationDisplay.textContent = this.formatTime(this.videoElement.duration);
        });
    }

    // Custom Theme Function
    private applyTheme(theme: VideoPlayerTheme):void{
        if (theme.backgroundColor) {
            this.videoElement.style.boxShadow = `0px 0px 20px 5px ${theme.backgroundColor}`;
        }

        if (theme.textColor) {
            this.container.style.color = theme.textColor;
        }

        if (theme.iconColor) {
            const icons = this.container.querySelectorAll("i");
            icons.forEach((icon) => {
              (icon as HTMLElement).style.color = theme.iconColor!;
            });
          }

        if (theme.sliderColor) {
            this.progressBar.style.accentColor = theme.sliderColor;
            this.volumeSlider.style.accentColor = theme.sliderColor;
        }
    }

    // Controls Icons Functions
    public play(): void {
        this.videoElement.play();
    }
    
    public pause(): void {
        this.videoElement.pause();
    }

    public stop(): void {
        this.videoElement.pause();
        this.videoElement.currentTime = 0;
    }

    public seekForward(seconds: number): void {
        this.videoElement.currentTime = Math.min(
            this.videoElement.duration,
            this.videoElement.currentTime + seconds
        );
    }

    public seekBackward(seconds: number): void {
        this.videoElement.currentTime = Math.max(0,
          this.videoElement.currentTime - seconds
        );
    }

    public setVolume(volume: number): void {
        this.videoElement.volume = volume;
    }    

    public seekToPercentage(percentage: number): void {
        if (this.videoElement.duration) {
            const newTime = (percentage / 100) * this.videoElement.duration;
            this.videoElement.currentTime = newTime;
        }
    }

    public toggleFullScreen(): void {
        if (!document.fullscreenElement) {
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen();
            } 
        } else{
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    private updateProgress(): void {
        if (this.videoElement.duration) {
            const progressPercentage = (this.videoElement.currentTime / this.videoElement.duration) * 100;
                this.progressBar.value = progressPercentage.toString();
                this.currentTimeDisplay.textContent = this.formatTime(
                this.videoElement.currentTime
            );
        }
    }

    private formatTime(time: number): string {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }

    public setSource(src: string): void {
        this.videoElement.src = src;
        this.videoElement.load();
    }
}

const mainContainer = document.createElement("div");
mainContainer.style.width = "640px"; 
mainContainer.style.margin = "20px auto"; 
document.body.appendChild(mainContainer);


const container1 = document.createElement("div");
container1.className = "video-container";
container1.style.marginBottom = "20px"; 
mainContainer.appendChild(container1);


const player = new CustomVideoPlayer({
    container: container1,
    src: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_20mb.mp4", 
    autoPlay: false,
    controls: true,
    loop: false,
    muted: false,
    theme: {
      backgroundColor: "#B5828C",
      textColor: "#FFF",
      iconColor: "#A6F1E0",
      sliderColor: "#DE3163",
    },
});
