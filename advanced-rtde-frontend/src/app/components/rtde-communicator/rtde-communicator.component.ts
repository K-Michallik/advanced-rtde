import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApplicationPresenterAPI, ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';
import { RtdeCommunicatorNode } from './rtde-communicator.node';
import { RtdeService } from './rtde.service';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';

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
    @Input() applicationNode: RtdeCommunicatorNode;
    private rtdeService: RtdeService = inject(RtdeService);

    readonly runtimeState$ = this.rtdeService.runtimeState$;
    readonly safetyStatus$ = this.rtdeService.safetyStatus$;
    readonly actualTcpPose$ = this.rtdeService.actualTcpPose$;
    readonly error$ = this.rtdeService.error$;

    protected isMonitoring: boolean = false;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.robotSettings) {
            if (changes.applicationAPI?.currentValue && changes.applicationAPI.firstChange) {
                const backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'advanced-rtde-backend', 'rest-api');
                this.rtdeService.setBackendUrl(backendUrl);
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
    }

    startMonitoring(): void {
        this.rtdeService.startMonitoring().subscribe({
            next: () => {
                this.isMonitoring = true;
                console.log('Monitoring started.');
            },
            error: error => {
                console.error('Failed to start monitoring:', error);
            }
        });
    }

    stopMonitoring(): void {
        this.rtdeService.stopMonitoring().subscribe({
            next: () => {
                this.isMonitoring = false;
                console.log('Monitoring stopped.');
            },
            error: error => {
                console.error('Failed to stop monitoring:', error);
            }
        });
    }


    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
