
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Web } from '@/utilities/web';
import Generator from '@/utilities/generator';







export interface IInvite {
  code: string;
  used: number;
  uses: number;
}

interface RenderedInvite extends IInvite {
  copied: boolean;
}







@Component
export default class InviteDisplay extends Vue {
  @Prop(Array) readonly invites: IInvite[];

  renderedInvites: RenderedInvite[] = [];


  private web!: Web;
  private copiedInvite = false;
  private gen = new Generator();


  get canDisplay() {
    return !!this.renderedInvites.length;
  }


  created() {
    this.web = new Web();
    this.$emit('populate');
  }

  @Watch('invites')
  watchInvites() {
    this.renderedInvites =
      this.invites.map(inv => {
        return {
          code: inv.code,
          uses: inv.uses ? inv.uses : Infinity,
          used: inv.used,
          copied: false,
          time: this.getInviteTimeout(inv)
        };
      })
      .sort((inv1, inv2) => {
        if (inv1.uses == Infinity && inv1.time.num == Infinity) return -1;
        if (inv1.time.num > inv2.time.num) return -1;
        return 1;
      })
    ;
  }


  async deleteInvite(code: string) {
    const {status, data} =
      await this.web.delete(`https://localhost:3003/protected/invite/${code}`)
    ;
    this.$emit('populate');
  }


  copyInvite(invite: RenderedInvite) {
    // Prevent excessive animation toggles
    if (invite.copied) return;
    navigator.clipboard.writeText(invite.code);
    invite.copied = true;
    setTimeout(() => {
      invite.copied = false;
    }, 1200);
  }


  private getInviteTimeout(invite: IInvite) {
    const timeCode = invite.code.substr(3);
    const timeLeft =
      this.gen.toTimeUnits(
        this.gen.baseToDec(timeCode, 36) - Date.now()
      )
    ;
    const tenYears = 3650; // In days

    let text = '';

    if (timeLeft.milliseconds <= 0) {
      text = 'Expired';
    }
    else if (timeLeft.days < 1) {
      text = `${timeLeft.hours.toFixed(1)}h`;
    }
    else {
      text = `${timeLeft.days.toFixed(1)}d`;
    }

    // Detect master and infinite invites
    if (timeLeft.days > tenYears) {
      return {
        left: 'INF',
        num: Infinity
      };
    }

    return {
      left: text,
      num: timeLeft.milliseconds
    };
  }
}




