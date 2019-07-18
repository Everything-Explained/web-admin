
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import MySelect from '@/components/elements/MySelect.vue';
import InviteDisplay from './components/invite_display/InviteDisplay.vue';
import { Web } from '@/utilities/web';
import { IInvite } from './components/invite_display/_inviteDisplay';







@Component({
  components: {
    MySelect,
    InviteDisplay
  }
})
export default class Invites extends Vue {
  invite = '';
  invites: IInvite[] = [];

  readonly selectUses = [1, 3, 5, 10, 100, Infinity];
  readonly selectDays = [1, 3, 7, 30, 90, Infinity];
  readonly inviteURI = '/protected/invite';

  private web: Web;
  private hours = 0;
  private uses = 0;


  get canGenerate() {
    return this.hours && this.uses;
  }

  get canSave() {
    return !!this.invite;
  }



  /** Lifecycle method, equivalent to constructor() */
  public created() {
    this.web = new Web();
  }





  public async generateInvite() {
    // 0 hours is infinite according to server API
    const hours = (this.hours == Infinity) ? 0 : this.hours;

    const {status, data} = await this.web.get(
      `${this.inviteURI}?hours=${hours}`,
    );

    this.invite = data;
  }



  public saveInvite() {
    // 0 uses is infinite according to server API
    const uses = (this.uses == Infinity) ? 0 : this.uses;
    const invite = this.invite;

    this.resetInvite();

    if (invite) {
      this.execInviteSave(invite, uses);
    }
  }



  public populateInvites() {
    setTimeout(async () => {
      const {status, data} = await this.web.get(
        `${this.inviteURI}/list`
      );
      if (status == 200) {
        this.invites = data as IInvite[];
      }
    }, 150);
  }



  public onDaySelect(days: number) {
    this.hours = days * 24;
    this.resetInvite();
  }



  public onUsesSelect(uses: number) {
    this.uses = uses;
    this.resetInvite();
  }



  /**
   * Toggles canSave() to prevent saving the same
   * invite multiple times.
   */
  private resetInvite() {
    this.invite = '';
  }



  /**
   * Frees saveInvite() from async so that it can
   * prevent accidental saves of the same invite.
   */
  private async execInviteSave(code: string, uses: number) {
    const {status, data} = await this.web.post(
      `${this.inviteURI}`,
      { code, uses }
    );
    this.populateInvites();
  }
}


