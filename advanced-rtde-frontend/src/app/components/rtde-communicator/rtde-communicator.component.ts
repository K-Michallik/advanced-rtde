import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApplicationPresenterAPI, ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';
import { RtdeCommunicatorNode } from './rtde-communicator.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { BackendService } from './backend.service';

@Component({
    templateUrl: './rtde-communicator.component.html',
    styleUrls: ['./rtde-communicator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtdeCommunicatorComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // applicationNode is required
    private _applicationNode: RtdeCommunicatorNode;
    private beService: BackendService = inject(BackendService);
    readonly data$ = this.beService.data$;
    readonly randomNumber$ = this.beService.randomNumber$;

    private backendWebsocketUrl: string;
    private backendHttpUrl: string;

    protected outputs = ["DO 0", "DO 1", "DO 2", "DO 3", "DO 4", "DO 5", "DO 6", "DO 7"];
    protected output : string;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef,
    ) {}

    // applicationNode is required
    get applicationNode(): RtdeCommunicatorNode {
        return this._applicationNode;
    }

    @Input()
    set applicationNode(value: RtdeCommunicatorNode) {
        this._applicationNode = value;
        this.cd.detectChanges();
    }

    // Getter for isMonitoring
    get isMonitoring(): boolean {
      return this.applicationNode.monitorState;
    }

    // Setter for isMonitoring
    set isMonitoring(value: boolean) {
      this.applicationNode.monitorState = value;
      this.saveNode();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.robotSettings) {
            if (changes.applicationAPI?.currentValue && changes.applicationAPI.firstChange) {
                this.backendWebsocketUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'advanced-rtde-backend', 'websocket-api');
                this.backendHttpUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'advanced-rtde-backend', 'rest-api');
            }

            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
        }

        if (changes?.applicationAPI && this.applicationAPI) {
            this.output = this.applicationNode.digitalOutput !== undefined
            ? this.outputs[this.applicationNode.digitalOutput] : "";
        }
    }

    startMonitoring(): void {
        this.isMonitoring = true;
        this.beService.connect(this.backendWebsocketUrl);
      }
    
      stopMonitoring(): void {
        this.isMonitoring = false;
        this.beService.disconnect();
      }

      getRandomNumber(): void {
        this.beService.fetchRandomNumber(this.backendHttpUrl);
      }

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }

    selectionChange($event: string){
        this.applicationNode.digitalOutput = this.outputs.indexOf($event);
        // Uncomment this to have the slider selection persist.
        // NOTE: Saving the application node will STOP any running programs.
        // this.saveNode();
        console.log(`Changed to DO${this.applicationNode.digitalOutput}`);
    }

    setDigitalOutput(value: number): void {
        if (this.applicationNode.digitalOutput !== undefined) {
            this.beService.setDigitalOutput(this.backendHttpUrl, this.applicationNode.digitalOutput, value);
        } else {
            console.error('Digital output is undefined.')
        }
      }

}
