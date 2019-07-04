
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Web } from '@/utilities/web';







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
          uses: inv.uses,
          used: inv.used,
          copied: false
        };
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
}




