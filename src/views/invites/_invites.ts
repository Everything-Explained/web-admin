import Vue from 'vue';
import Component from 'vue-class-component';
import MySelect from '@/components/elements/MySelect.vue';
import { Web } from '@/utilities/web';

@Component({
  components: {
    MySelect
  }
})
export default class Invites extends Vue {

  public selectUses = [1, 5, 10, 100, Infinity];
  public selectDays = [1, 5, 30, 90, Infinity];

  private web: Web;
  private hours = 0;
  private uses = 0;

  public invite = '';

  get canGenerate() {
    return this.hours && this.uses;
  }

  get canSave() {
    return !!this.invite;
  }


  public created() { this.web = new Web(); }


  public async generateInvite() {
    // 0 hours is infinite according to server API
    const hours = (this.hours == Infinity) ? 0 : this.hours;

    const {status, data} = await this.web.get(
      `https://localhost:3003/protected/invite?hours=${hours}`,
    );
    this.invite = data;
  }


  public execInvite() {
    // 0 uses is infinite according to server API
    const uses = (this.uses == Infinity) ? 0 : this.uses;
    const invite = this.invite;

    // Prevent saving the same invite again
    this.invite = '';

    if (invite) {
      this.saveInvite(invite, uses);
    }
  }


  public onDaySelect(days: number) {
    this.hours = days * 24;
  }


  public onUsesSelect(uses: number) {
    this.uses = uses;
  }



  /**
   * Frees execInvite() from async so that it can
   * prevent accidental saves of the same invite.
   */
  private async saveInvite(code: string, uses: number) {
    const {status, data} = await this.web.post(
      `https://localhost:3003/protected/invite`,
      { code, uses }
    );
  }
}


