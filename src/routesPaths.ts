export class Paths {
  public static readonly gameAction = '/api/post/game/action'
  public static readonly gameUpdateView = '/api/get/game/view'
  public static readonly levelRequest = '/api/get/levels/new'
  public static readonly levelSubmit = '/api/get/levels/submit'
  public static readonly levelPageInfo = '/api/get/levelpage'
  public static readonly levelBelongToSection = '/api/get/levelSection'
  public static readonly userLogin = '/api/post/user/login'
  public static readonly userRegister = '/api/post/user/register'
  public static readonly userLogout = '/api/post/user/logout'
  public static readonly userLevels = '/api/get/user/levels'
  public static readonly userInfo = '/api/get/user/info'
  public static readonly submitLevelJson = '/api/post/editor/level'
  public static readonly fetchNewLevels = '/api/get/arena/fetch'
  public static readonly getArenaLevelByLid = '/api/get/arena/level'

  
}

export class SocketEvents {
  public static readonly connection = 'connection'
  public static readonly updateGameState = 'updateGame'
  public static readonly refreshGameState = 'refreshGame'
}