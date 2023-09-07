import { forEachChild } from 'typescript';
import { Debug, GameObject, Mathf, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { Image, Slider } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoText } from 'ZEPETO.World.Gui';
import UIPlayerListTemplate from '../UI/UIPlayerListTemplate';
import GameManager from './GameManager';

export default class UIManager extends ZepetoScriptBehaviour {
    public static instance: UIManager;

    public iconImagePrefab: GameObject;

    public icon: GameObject;
    public iconCharge: Image;

    public txtTime: ZepetoText;
    public teamSelectorObj: GameObject;
    public uiTeamLayoutPrefab: GameObject;
    private _hunterTeamList: UIPlayerListTemplate[];
    private _propTeamList: UIPlayerListTemplate[];

    @SerializeField() huntersParent: Transform;
    @SerializeField() nonHuntersParent: Transform;

    @Header("NonHunter")
    @SerializeField() private nonHunterCanvas: GameObject;
    public sliderRot: Slider;

    @Header("Hunter")
    @SerializeField() private hunterCanvas: GameObject;
    @SerializeField() private catchedText: ZepetoText;

    private allPlayers: string[];

    Awake() {
        if (UIManager.instance != null) GameObject.Destroy(this.gameObject);
        else UIManager.instance = this;

        this._hunterTeamList = [];
        this._propTeamList = [];
        this.allPlayers = [];
    }

    CreateTeamMember(isHunter: bool, user: string)
    {
        if(this.allPlayers.includes(user) == false)
        {
            this.allPlayers.push(user);

            let uiPlayerList: UIPlayerListTemplate = GameObject.Instantiate(this.uiTeamLayoutPrefab, this.nonHuntersParent) as UIPlayerListTemplate;
    
            uiPlayerList.name = user;
            uiPlayerList.GetComponent<UIPlayerListTemplate>().SetText(user);
            this._propTeamList.push(uiPlayerList);
        }


        /*
        if (isHunter)
        {
            let uiPlayerList: UIPlayerListTemplate = GameObject.Instantiate(this.uiTeamLayoutPrefab, this.nonHuntersParent) as UIPlayerListTemplate;
            uiPlayerList.name = user;
            uiPlayerList.GetComponent<UIPlayerListTemplate>().SetText(user);
            this._hunterTeamList.push(uiPlayerList);
        }
        else
        {
            let uiPlayerList: UIPlayerListTemplate = GameObject.Instantiate(this.uiTeamLayoutPrefab, this.huntersParent) as UIPlayerListTemplate;

            uiPlayerList.GetComponent<UIPlayerListTemplate>().SetText(user);
            this._propTeamList.push(uiPlayerList);
        }*/
    }

    ChangeTeam(userId: string, isHunter: bool)
    {
        
        if (isHunter)
        {
            let playerListTemplate : UIPlayerListTemplate = this._propTeamList.find((element) => element.name == userId);
            if(playerListTemplate) 
            {
                playerListTemplate.GetComponent<UIPlayerListTemplate>().ChangeParent(this.huntersParent);

                let playerInHunters : UIPlayerListTemplate = this._hunterTeamList.find((element) => element.name == userId);
                if(!playerInHunters) 
                {
                    this._hunterTeamList.push(playerListTemplate);
                    let index = this._propTeamList.indexOf(playerListTemplate);

                    this._propTeamList.splice(index, this._propTeamList.length);
                }

                this.ShowHunterUI();
            }
        }
        else
        {
            let playerListTemplate : UIPlayerListTemplate = this._hunterTeamList.find((element) => element.name == userId);
            if(playerListTemplate) 
            {

                playerListTemplate.GetComponent<UIPlayerListTemplate>().ChangeParent(this.nonHuntersParent);
                
                let playerInProps : UIPlayerListTemplate = this._propTeamList.find((element) => element.name == userId);
                if(!playerInProps)
                {
                    this._propTeamList.push(playerListTemplate);
                    let index = this._hunterTeamList.indexOf(playerListTemplate);

                    this._hunterTeamList.splice(index, this._hunterTeamList.length);
                }

                this.ShowNonHunterUI();
            }
        }        
    } 

    SetReady(userId: string, isHunter: boolean, isReady : boolean)
    {
        if(!isReady) return;

        if(isHunter){
            let playerListTemplate : UIPlayerListTemplate = this._hunterTeamList.find((element) => element.name == userId);
            if(playerListTemplate) { playerListTemplate.GetComponent<UIPlayerListTemplate>().SetReady(); }
        }
        else
        {
            let playerListTemplate : UIPlayerListTemplate = this._propTeamList.find((element) => element.name == userId);
            if(playerListTemplate) { playerListTemplate.GetComponent<UIPlayerListTemplate>().SetReady(); }
        }

        //GameManager.instance.StartGame();

    }

    // This method controls the visual of the timer, normalizing the time to mins and secs
    UpdateTimeRemaining(timeRemaining: number) {
        // We round the value of the minutes
        let tempMin: number = Mathf.FloorToInt(timeRemaining / 60);

        // We round the value of the seconds
        let tempSeg: number = Mathf.RoundToInt(timeRemaining % 60);

        // We create a text variable for the minutes
        let tempMinString: string = tempMin <= 0 ? " " : tempMin.toString() + " : ";

        // We create a text variable for the seconds
        let tempSegString: string = tempSeg < 10 ? "0" + tempSeg : tempSeg.toString();

        // We update the "remaininTxt" text to a text string consisting of "tempMinString" and "tempSegString"
        this.txtTime.text = tempMinString + tempSegString;
    }

    UpdateChargeFillAmount(percentage: number) {
        this.iconCharge.fillAmount = percentage;
    }

    ShowIconPercentage(show: bool, pointerPos: Vector3) {
        if (show != this.icon.activeSelf) this.icon.SetActive(show);
        this.icon.transform.position = pointerPos;
    }

    ShowCatchedText() {
        this.StartCoroutine(this.ShowCatchedTextCoroutine());
    }

    *ShowCatchedTextCoroutine() {
        this.catchedText.gameObject.SetActive(true);
        yield new WaitForSeconds(1);
        this.catchedText.gameObject.SetActive(false);
    }

    ShowNonHunterUI(show: bool = true) {
        this.hunterCanvas.SetActive(!show);
        this.nonHunterCanvas.SetActive(show);
    }

    ShowHunterUI(show: bool = true) {
        this.nonHunterCanvas.SetActive(!show);
        this.hunterCanvas.SetActive(show);
    }

}