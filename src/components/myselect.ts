import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    props: {
      options: {
        type: Array,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
  },
})

// TODO: Add active-arrow toggle
export default class MySelect extends Vue {

  // from parent
  public options!: string[];

  public selectedIndex = -1;
  public hidden = true;

  // When user clicks anywhere else on the document
  public _blur!: (ev: MouseEvent) => void;

  public isActive = !this.hidden;


  public created() {
    this._blur = ((_this: MySelect) => {
      return (ev: MouseEvent) => {
        _this.toggle(ev, true);
      };
    })(this);

    document.addEventListener('click', this._blur);
  }


  public destroyed() {
    document.removeEventListener('click', this._blur);
  }


  public select(i: number) {
    this.selectedIndex = i;
  }

  public toggle(ev: MouseEvent, state?: boolean) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();

    if (state !== undefined)
      this.hidden = state;
    else
      this.hidden = !this.hidden
    ;

    this.isActive = !this.hidden;

  }
}
