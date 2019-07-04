
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Web } from '@/utilities/web';







export interface IInvite {
  code: string;
  used: number;
  uses: number;
}







@Component
export default class InviteDisplay extends Vue {
  @Prop(Array) readonly invites: IInvite[];

  private web!: Web;


  created() {
    this.web = new Web();
  }

  @Watch('invites')
  watchInvites() {
    console.debug(this.invites);
  }



  async deleteInvite(code: string) {
    const {status, data} =
      await this.web.delete(`https://localhost:3003/protected/invite/${code}`)
    ;

    this.$emit('populate');
  }
}




